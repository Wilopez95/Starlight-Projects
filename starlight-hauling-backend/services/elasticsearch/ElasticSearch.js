import assert from 'assert';
import elasticsearch from '@opensearch-project/opensearch';
import httpStatus from 'http-status';
import camelCase from 'lodash/fp/camelCase.js';
import pickBy from 'lodash/pickBy.js';
import isNil from 'lodash/isNil.js';

import ApiError from '../../errors/ApiError.js';

import {
  ELASTIC_URL,
  ELASTIC_PORT,
  AUDIT_LOGS_ELASTIC_URL,
  AUDIT_LOGS_ELASTIC_PORT,
} from '../../config.js';
import { INVALID_REQUEST } from '../../errors/codes.js';

import { NON_TENANT_INDICES, TENANT_INDICES, TENANT_INDEX } from '../../consts/searchIndices.js';

const { Client } = elasticsearch;
const DEFAULT_LIMIT = 5;
const DEFAULT_TIMEOUT = '30s';
const DEFAULT_TIMEOUT_MS = '3e4';

let client;
let auditLogClient;

export const getClient = ctx => {
  if (!client) {
    try {
      client = new Client({
        node: `${ELASTIC_URL}:${ELASTIC_PORT}`,
        ssl: { rejectUnauthorized: false },
      });
    } catch (error) {
      ctx.logger.error('ES connection cannot be established');
      throw error;
    }
  }
  return client;
};
export const getAuditLogClient = ctx => {
  if (!auditLogClient) {
    try {
      auditLogClient = new Client({
        node: `${AUDIT_LOGS_ELASTIC_URL}:${AUDIT_LOGS_ELASTIC_PORT}`,
        ssl: { rejectUnauthorized: false },
      });
    } catch (error) {
      ctx.logger.error('ES [al] connection cannot be established');
      throw error;
    }
  }
  return auditLogClient;
};

export const mapSource = document =>
  Object.entries(document)
    .map(([k, v]) => `ctx._source["${k}"] = "${v}"`)
    .join('; ');

export const clean = document => pickBy(document, v => !isNil(v) && !Number.isNaN(v) && v !== '');

export const applyTenantToIndex = (indexName, tenant) => `${indexName}__${tenant.toLowerCase()}`;

export const getFirstIndexName = indexResult => Object.keys(indexResult?.body || {})[0] || null;
export const getFirstAliasName = indexResult => {
  const firstIndexName = getFirstIndexName(indexResult);
  if (!firstIndexName) {
    return null;
  }
  const aliasesNames =
    (indexResult.body[firstIndexName] &&
      indexResult.body[firstIndexName].aliases &&
      Object.keys(indexResult.body[firstIndexName].aliases)) ||
    [];

  return aliasesNames.length ? aliasesNames[0] : null;
};

export const getIndexName = index => index?.settings?.index?.provided_name || null;

export const getIndexAlias = index => {
  const aliasesNames = (index && index.aliases && Object.keys(index.aliases)) || [];

  return aliasesNames.length ? aliasesNames[0] : null;
};

export const templateExists = async (ctx, templateName) => {
  ctx.logger.debug(`ES->templateExists->${templateName}`);

  const isAuditLogTemplate = templateName === TENANT_INDEX.auditLogs;
  const esClient = isAuditLogTemplate ? getAuditLogClient(ctx) : getClient(ctx);

  try {
    const result = await esClient.indices.existsTemplate({ name: templateName });

    ctx.logger.debug(`ES->templateExists->${templateName}->result.body: ${!!result?.body}`);
    return !!result?.body;
  } catch (error) {
    ctx.logger.info(`Failed to check existence of template "${templateName}"`);
    throw error;
  }
};

export const templateVersionChanged = async (ctx, templateName, currentVersion) => {
  ctx.logger.debug(
    `ES->templateVersionChanged->${templateName}->currentVersion: ${currentVersion}`,
  );

  const isAuditLogTemplate = templateName === TENANT_INDEX.auditLogs;
  const esClient = isAuditLogTemplate ? getAuditLogClient(ctx) : getClient(ctx);

  try {
    const result = await esClient.indices.getTemplate({ name: templateName });

    const template = result?.body && result.body[templateName];
    const version = template?.version;

    ctx.logger.debug(`ES->templateVersionChanged->${templateName}->version: ${version}`);

    return String(version) !== String(currentVersion);
  } catch (error) {
    ctx.logger.info(`Failed to compare version "${currentVersion}" for template "${templateName}"`);
    throw error;
  }
};

export const upsertTemplate = async (ctx, templateName, content) => {
  ctx.logger.debug(`ES->upsertTemplate->${templateName}}`);

  const isAuditLogTemplate = templateName === TENANT_INDEX.auditLogs;
  const esClient = isAuditLogTemplate ? getAuditLogClient(ctx) : getClient(ctx);

  try {
    const result = await esClient.indices.putTemplate({
      name: templateName,
      body: content,
    });

    return !!result?.body?.acknowledged;
  } catch (error) {
    ctx.logger.info(`Failed to upsert template "${templateName}"`);
    throw error;
  }
};

export const createIndex = async (ctx, indexName, aliasName, esClient = getClient(ctx)) => {
  ctx.logger.debug(`ES->createIndex->${indexName}->aliasName: ${aliasName}`);

  try {
    const result = await esClient.indices.create({
      index: indexName,
      body: {
        aliases: {
          [aliasName]: {},
        },
      },
    });

    const firstIndexName = getFirstIndexName(result);
    if (!firstIndexName) {
      return null;
    }

    return result.body[firstIndexName];
  } catch (error) {
    ctx.logger.info(`Failed to create index "${indexName}" with alias "${aliasName}"`);
    throw error;
  }
};

export const closeIndex = async (ctx, indexName) => {
  ctx.logger.debug(`ES->closeIndex->${indexName}`);
  try {
    const result = await getClient(ctx).indices.close({
      index: indexName,
    });
    return !!result;
  } catch (error) {
    ctx.logger.info(`Failed to close index "${indexName}"`);
    throw error;
  }
};

export const freezeIndex = async (ctx, indexName) => {
  ctx.logger.debug(`ES->freezeIndex->${indexName}`);
  try {
    const result = await getClient(ctx).indices.freeze({
      index: indexName,
    });
    return !!result;
  } catch (error) {
    ctx.logger.info(`Failed to freeze index "${indexName}"`);
    throw error;
  }
};

export const dropIndex = async (ctx, indexName, esClient = getClient(ctx)) => {
  ctx.logger.debug(`ES->dropIndex->${indexName}`);
  try {
    const result = await esClient.indices.delete({ index: indexName });
    return !!result;
  } catch (error) {
    ctx.logger.info(`Failed to drop index "${indexName}"`);
    throw error;
  }
};

export const dropIndices = async (ctx, templatesNames) => {
  ctx.logger.debug(`ES->dropIndices: ${JSON.stringify(templatesNames)}`);
  try {
    await getClient(ctx).indices.delete({
      index: templatesNames.map(i => `${i}*`).join(','),
      allow_no_indices: true,
    });
    return true;
  } catch (error) {
    ctx.logger.info(`Failed to drop indices for "${templatesNames.join(', ')}"`);
    throw error;
  }
};

export const dropTemplates = async (ctx, templatesNames) => {
  ctx.logger.debug(`ES->dropTemplates: ${JSON.stringify(templatesNames)}`);
  try {
    await Promise.all(
      templatesNames.map(templateName =>
        getClient(ctx)
          .indices.deleteTemplate({
            name: templateName,
          })
          .catch(error => {
            if (error?.meta?.statusCode !== 404) {
              throw error;
            }
          }),
      ),
    );
    return true;
  } catch (error) {
    ctx.logger.info(`Failed to drop templates "${templatesNames.join(', ')}"`);
    throw error;
  }
};

export const reset = async ctx => {
  await dropIndices(ctx, TENANT_INDICES);
  await dropTemplates(ctx, TENANT_INDICES);
  return true;
};

export const _getIndex = async (ctx, indexName, esClient) => {
  try {
    const result = await esClient.indices.get({ index: indexName });
    if (result?.body && indexName in result.body) {
      return result.body[indexName];
    }
    return result;
  } catch (error) {
    if (error?.meta?.statusCode === 404) {
      return null;
    }
    ctx.logger.info(`Failed to get index "${indexName}"`);
    throw error;
  }
};

export const getIndex = async (ctx, indexName, esClient = getClient(ctx)) => {
  ctx.logger.debug(`ES->getIndex->${indexName}`);
  try {
    const result = await esClient.indices.get({ index: indexName });
    if (result?.body && indexName in result.body) {
      return result.body[indexName];
    }

    const firstIndexName = getFirstIndexName(result);
    return firstIndexName ? result.body[firstIndexName] : null;
  } catch (error) {
    if (error?.meta?.statusCode === 404) {
      return null;
    }
    ctx.logger.info(`Failed to get index "${indexName}"`);
    throw error;
  }
};

export const getIndexAliasName = async (ctx, indexName, esClient = getClient(ctx)) => {
  ctx.logger.debug(`ES->getIndexAliasName->${indexName}`);

  ctx.logger.debug(`ES->getIndex->${indexName}`);
  try {
    const result = await esClient.indices.get({ index: indexName });
    if (result?.body && indexName in result.body) {
      return result.body[indexName];
    }

    return result ? getFirstIndexName(result) : null;
  } catch (error) {
    if (error?.meta?.statusCode === 404) {
      return null;
    }
    ctx.logger.info(`Failed to get index "${indexName}"`);
    throw error;
  }
};

export const setIndexAlias = async (ctx, indexName, aliasName, esClient = getClient(ctx)) => {
  ctx.logger.debug(`ES->setIndexAlias->${indexName}->aliasName: ${aliasName}`);
  try {
    const result = await esClient.indices.putAlias({
      name: aliasName,
      index: indexName,
    });
    return !!result?.body;
  } catch (error) {
    ctx.logger.info(`Failed to set alias "${aliasName}" for index "${indexName}"`);
    throw error;
  }
};

export const deleteIndexAlias = async (ctx, indexName, aliasName, esClient = getClient(ctx)) => {
  ctx.logger.debug(`ES->deleteIndexAlias->${indexName}->aliasName: ${aliasName}`);
  try {
    const result = await esClient.indices.deleteAlias({
      name: aliasName,
      index: indexName,
    });
    return !!result?.body;
  } catch (error) {
    ctx.logger.info(`Failed to drop alias "${aliasName}" from index "${indexName}"`);
    throw error;
  }
};

export const renameIndexAlias = async (
  ctx,
  indexName,
  oldAliasName,
  newAliasName,
  esClient = getClient(ctx),
) => {
  ctx.logger.debug(`ES->renameIndexAlias->${indexName}->oldAliasName: ${oldAliasName}`);
  ctx.logger.debug(`ES->renameIndexAlias->${indexName}->newAliasName: ${newAliasName}`);

  assert.ok(oldAliasName && newAliasName, 'Index alias cannot be empty');

  try {
    await setIndexAlias(ctx, indexName, newAliasName, esClient);
    await deleteIndexAlias(ctx, indexName, oldAliasName, esClient);
  } catch (error) {
    ctx.logger.info(`Failed to rename alias from "${oldAliasName}" to "${newAliasName}"`);
    throw error;
  }
};

export const updateDocument = (ctx, indexName, query, document) =>
  getClient(ctx).updateByQuery({
    index: indexName,
    body: {
      query,
      script: document,
    },
  });

export const indexDocument = (ctx, indexName, document) =>
  getClient(ctx).index({
    id: document.id,
    index: indexName,
    body: clean(document),
  });

export const indexAlDocument = (ctx, indexName, document) =>
  getAuditLogClient(ctx).index({
    body: clean(document),
    refresh: false,
    index: indexName,
  });

export const deleteDocument = (ctx, indexName, { id } = {}) =>
  getClient(ctx).delete({
    id,
    index: indexName,
  });

export const search = async (
  ctx,
  templateName,
  indexName,
  { query, limit = DEFAULT_LIMIT, skip = 0, ...params } = {},
) => {
  const template = {
    id: templateName,
    params: { size: limit, from: skip, query, ...params },
  };
  const isAuditLogTemplate = templateName === TENANT_INDEX.auditLogs;
  const esClient = isAuditLogTemplate ? getAuditLogClient(ctx) : getClient(ctx);

  try {
    const results = await esClient.searchTemplate({
      index: indexName,
      body: template,
    });

    const items = results?.body?.hits;
    return {
      [camelCase(templateName)]:
        items?.hits?.map(hit => ({
          ...hit._source,
          id: hit._id,
          highlight: hit.highlight,
        })) || [],
      total: items?.total?.value || 0,
      length: items?.hits?.length || 0,
    };
  } catch (error) {
    if (error?.type !== 'index_not_found_exception') {
      ctx.logger.error(`Failed to perform search for: "${templateName}"`);
    }
    const cause = error?.body?.error?.root_cause?.[0];
    cause && ctx.logger.debug(cause);
    if (error?.body?.error?.type === 'json_parse_exception') {
      ctx.logger.info(`Search template ${templateName} is invalid`);
    }
    ctx.logger.error(error);
    return {};
  }
};

export const multiSearchNew = async (ctx, templates, searchConfigs) => {
  try {
    const results = await getClient(ctx).msearchTemplate({
      body: templates,
    });

    return (
      results?.body?.responses?.reduce((result, item, i) => {
        if (item.error) {
          throw new Error(JSON.stringify(item.error));
        }

        return Object.assign(result, {
          [camelCase(searchConfigs[i].template)]:
            item?.hits?.hits?.map(hit => ({
              ...hit._source,
              id: hit._id,
              highlight: hit.highlight,
            })) || [],
        });
      }, {}) || []
    );
  } catch (error) {
    if (error?.type !== 'index_not_found_exception') {
      ctx.logger.error(
        `Failed to perform multi-search for: "${searchConfigs
          .map(config => config.template)
          .join(', ')}"`,
      );
      ctx.logger.error(error);
    }
    return {};
  }
};

export const multiSearch = async (
  ctx,
  searchConfigs,
  { query, limit = DEFAULT_LIMIT, ...params } = {},
) => {
  const templates = searchConfigs.flatMap(({ index, template }) => [
    { index },
    { id: template, params: { size: limit, query, ...params } },
  ]);

  try {
    const results = await getClient(ctx).msearchTemplate({
      body: templates,
    });

    return (
      results?.body?.responses?.reduce((result, item, i) => {
        if (item.error) {
          throw new Error(JSON.stringify(item.error));
        }

        return Object.assign(result, {
          [camelCase(searchConfigs[i].template)]:
            item?.hits?.hits?.map(hit => ({
              ...hit._source,
              id: hit._id,
              highlight: hit.highlight,
            })) || [],
        });
      }, {}) || []
    );
  } catch (error) {
    if (error?.type !== 'index_not_found_exception') {
      ctx.logger.error(
        `Failed to perform multi-search for: "${searchConfigs
          .map(config => config.template)
          .join(', ')}"`,
      );
      ctx.logger.error(error);
    }
    return {};
  }
};

export const uploadDocuments = async (ctx, indexName, items = [], timeout = DEFAULT_TIMEOUT) => {
  assert.ok(
    Array.isArray(items) && items.length > 0,
    'You must put at least one document to index',
  );

  const data = items.reduce((res, item) => {
    res.push({ index: { _id: item.id } }, clean(item));
    return res;
  }, []);

  await getClient(ctx).bulk({
    index: indexName,
    body: data,
    refresh: true,
    timeout,
  });
};

export const verifyIndexName = indexName => {
  if (!TENANT_INDICES.includes(indexName) && !NON_TENANT_INDICES.includes(indexName)) {
    throw new ApiError(
      'No such index configured',
      INVALID_REQUEST,
      httpStatus.UNPROCESSABLE_ENTITY,
    );
  }
};

export const streamDocuments = async (ctx, _index, datasource, wait = DEFAULT_TIMEOUT_MS) => {
  let counter = 0;

  await getClient(ctx).helpers.bulk({
    datasource,
    onDocument(item) {
      counter++;
      return { index: { _index, _id: item.id } };
    },
    onDrop(item) {
      ctx.logger.info(`ES sync for document ${JSON.stringify(item)} failed & skipped`);
      counter--;
      // bulkOperation.abort();
    },
    refreshOnCompletion: _index,
    wait,
  });

  return counter;
};

export default { reset };
