import { promises as fsPromises } from 'fs';
import { parse } from 'path';

import { format } from 'date-fns';

import TenantRepo from '../../repos/tenant.js';

import { logger } from '../../utils/logger.js';

import { SKIP_ES_SYNC } from '../../config.js';

import { TENANT_INDEX } from '../../consts/searchIndices.js';
import { exec as publishToES } from './publishers.js';
import {
  getClient,
  getAuditLogClient,
  getIndexAlias,
  getIndexName,
  dropIndex,
  renameIndexAlias,
  createIndex,
  getIndex,
  templateExists,
  templateVersionChanged,
  upsertTemplate,
  verifyIndexName,
  applyTenantToIndex,
} from './ElasticSearch.js';

const indexTemplatesDir = `${process.cwd()}/services/elasticsearch/indices`;
const searchTemplatesDir = `${process.cwd()}/services/elasticsearch/searchTemplates`;

const forEachFile = async (directory, callback) => {
  const files = await fsPromises.readdir(directory);
  return Promise.all(
    files.map(file =>
      fsPromises
        .readFile(`${directory}/${file}`, { encoding: 'utf-8' })
        .then(fileContent => ({ fileName: file, fileContent }))
        .then(callback),
    ),
  );
};

const listIndexTemplates = async () => {
  const indexesFolderContent = await fsPromises.readdir(indexTemplatesDir, {
    withFileTypes: true,
  });

  const templatesFolders = indexesFolderContent
    .filter(i => i.isDirectory())
    .map(i => `${indexTemplatesDir}/${i.name}`);

  const templatesFoldersContent = await Promise.all(
    templatesFolders.map(folder => fsPromises.readdir(folder)),
  );

  const templatesFiles = templatesFoldersContent.reduce((res, folderFiles, i) => {
    const templateFile = folderFiles.find(file => file === 'template.json');
    if (templateFile) {
      res.push(`${templatesFolders[i]}/${templateFile}`);
    }
    return res;
  }, []);

  const templates = await Promise.all(
    templatesFiles.map(file =>
      fsPromises
        .readFile(file)
        .then(JSON.parse)
        .catch(_err => logger.error(`Template ${file} parsing failed as json`)),
    ),
  );
  return templates;
};

const syncSearchTemplates = ctx =>
  forEachFile(searchTemplatesDir, template => {
    const templateName = parse(template.fileName).name;
    const esClient =
      templateName === TENANT_INDEX.auditLogs ? getAuditLogClient(ctx) : getClient(ctx);

    return esClient.putScript({
      id: parse(template.fileName).name,
      body: {
        script: {
          lang: 'mustache',
          source: template.fileContent,
        },
      },
    });
  });

const syncIndex = async (
  ctx,
  {
    template: { name: templateName, level } = {},
    timestamp,
    resyncRequired,
    tenant = 'root',
    tenants, // needs in case of level=root only
  },
) => {
  ctx.logger.debug(`es->syncIndex->${templateName}->${tenant}->timestamp: ${timestamp}`);
  ctx.logger.debug(`es->syncIndex->${templateName}->${tenant}->resyncRequired: ${resyncRequired}`);

  const isAuditLogTemplate = templateName === TENANT_INDEX.auditLogs;
  const esClient = isAuditLogTemplate ? getAuditLogClient(ctx) : getClient(ctx);

  const alias = level !== 'root' ? `${applyTenantToIndex(templateName, tenant)}` : templateName;
  ctx.logger.debug(`es->syncIndex->${templateName}->${tenant}->alias: ${alias}`);

  let resync = resyncRequired;
  try {
    const index = await getIndex(ctx, alias, esClient);
    if (!index) {
      resync = true;
    }
    if (index && resync) {
      const oldAliasName = getIndexAlias(index);
      const indexName = getIndexName(index);
      ctx.logger.debug(`es->syncIndex->${templateName}->${tenant}->oldAliasName: ${oldAliasName}`);
      if (oldAliasName) {
        const newAliasName = `${oldAliasName}__${timestamp}__old`;
        ctx.logger.debug(
          `es->syncIndex->${templateName}->${tenant}->newAliasName: ${newAliasName}`,
        );

        await renameIndexAlias(ctx, indexName, oldAliasName, newAliasName, esClient);
      }
      // as we can't close indices in AWS then we only can drop old indices
      // to avoid usage of old indices during re-sync
      await dropIndex(ctx, indexName, esClient);
    }

    if (resync) {
      ctx.logger.debug(`es->syncIndex->${templateName}->${tenant}->index->create: ${alias}`);
      await createIndex(ctx, `${alias}__${timestamp}`, alias, esClient);

      if (!isAuditLogTemplate) {
        ctx.logger.debug(`es->syncIndex->${templateName}->${tenant}->resync: ${resync}`);

        await publishToES(ctx, {
          templateName,
          level,
          tenants: level === 'tenant' ? [tenant] : tenants,
          alias,
        });
      }
    }
  } catch (error) {
    ctx.logger.info(`"${templateName}" index sync failed for "${tenant}"`);
    throw error;
  }
};

const syncTemplate = async (ctx, { template, tenants, timestamp, resyncRequired }) => {
  const { name: templateName } = template;
  ctx.logger.debug(`es->syncTemplate->${templateName}->timestamp: ${timestamp}`);

  let resync = resyncRequired;
  try {
    const exists = await templateExists(ctx, templateName);
    if (!exists) {
      resync = true;
    } else {
      const versionChanged = await templateVersionChanged(
        ctx,
        templateName,
        template.content.version,
      );
      ctx.logger.debug(`es->syncTemplate->${templateName}->versionChanged: ${versionChanged}`);
      if (versionChanged) {
        resync = true;
      }
    }

    if (resync) {
      await upsertTemplate(ctx, templateName, template.content);
    }

    ctx.logger.debug(`es->syncTemplate->${templateName}->resync: ${resync}`);

    const { level } = template;
    if (level === 'root') {
      await syncIndex(ctx, {
        template,
        timestamp,
        resyncRequired: resync,
        tenants,
      });
    } else if (level === 'tenant') {
      await Promise.all(
        tenants.map(tenant =>
          syncIndex(ctx, {
            template,
            timestamp,
            resyncRequired: resync,
            tenant,
          }),
        ),
      );
    }
  } catch (error) {
    ctx.logger.info(`"${templateName}" template sync failed"`);
    throw error;
  }
};

export const sync = async (
  ctx,
  { resyncRequired = false, templatesFilter = [], tenantsFilter = [], appInit = false } = {},
) => {
  if (appInit && SKIP_ES_SYNC) {
    return ctx.logger.info('ES: setup is skipped');
  }

  ctx.logger.info('ES: setup and data sync started');

  ctx.logger.debug(`es->sync->resyncRequired: ${resyncRequired}`);
  ctx.logger.debug(`es->sync->templatesFilter: ${JSON.stringify(templatesFilter)}`);
  ctx.logger.debug(`es->sync->tenantsFilter: ${JSON.stringify(tenantsFilter)}`);

  const timestamp = format(new Date(), 'yyyyMMddHHmmss');
  ctx.logger.debug(`es->sync->timestamp: ${timestamp}`);

  for (const templateFilter of templatesFilter) {
    verifyIndexName(templateFilter);
  }

  try {
    let tenantsQuery = TenantRepo.getInstance(ctx.state).getAll({
      fields: ['name'],
    });
    if (tenantsFilter.length) {
      tenantsQuery = tenantsQuery.whereIn('name', tenantsFilter);
    }

    let tenants = await tenantsQuery;
    if (tenants?.length) {
      tenants = tenants.map(t => t.name) ?? [];
    }

    ctx.logger.debug(`es->sync->tenants: ${JSON.stringify(tenants)}`);

    const templatesList = await listIndexTemplates();

    const templates = templatesFilter.length
      ? templatesList.filter(t => templatesFilter.includes(t.name) && !!t.syncAllowed)
      : templatesList.filter(t => !!t.syncAllowed);

    await syncSearchTemplates(ctx);

    if (tenants?.length) {
      await Promise.all(
        templates?.map(template =>
          syncTemplate(ctx, {
            template,
            tenants,
            timestamp,
            resyncRequired,
          }),
        ),
      );
    }

    return ctx.logger.info('ES: setup is successful.');
  } catch (error) {
    ctx.logger.info('ES: setup failed! Exiting...');
    throw error;
  }
};

export default { sync };
