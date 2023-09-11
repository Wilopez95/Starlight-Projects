import * as elasticsearch from '@opensearch-project/opensearch';
import { camelCase } from 'lodash/fp';
import {
  AUDIT_LOGS_ELASTIC_PORT,
  AUDIT_LOGS_ELASTIC_URL,
  ELASTIC_PORT,
  ELASTIC_URL,
} from '../../config/config';

import { TENANT_INDEX } from '../../consts/searchIndices';
import { IESSearch, ISearchParams, IESCount, ICountParams } from '../../Interfaces/ElasticSearch';
import { ICustomError } from '../../Interfaces/CustomError';
import { Context } from '../../Interfaces/Auth';

const { Client } = elasticsearch;
const DEFAULT_LIMIT = 5;

let client;
let auditLogClient;

export const getClient = (ctx: Context) => {
  if (!client) {
    try {
      client = new Client({
        node: `${ELASTIC_URL}:${ELASTIC_PORT}`,
        ssl: { rejectUnauthorized: false },
      });
    } catch (error: unknown) {
      ctx.logger.error('ES connection cannot be established');
      throw error;
    }
  }
  return client;
};
export const getAuditLogClient = (ctx: Context) => {
  if (!auditLogClient) {
    try {
      auditLogClient = new Client({
        node: `${AUDIT_LOGS_ELASTIC_URL}:${AUDIT_LOGS_ELASTIC_PORT}`,
        ssl: { rejectUnauthorized: false },
      });
    } catch (error: unknown) {
      ctx.logger.error('ES [al] connection cannot be established');
      throw error;
    }
  }
  return auditLogClient;
};

export const applyTenantToIndex = (indexName, tenant) => `${indexName}__${tenant.toLowerCase()}`;

export const search = async <T>(
  ctx: Context,
  templateName: string,
  indexName: string,
  { query, limit = DEFAULT_LIMIT, skip = 0, sort, bool, ...params }: ISearchParams = {},
): Promise<IESSearch<T> | null> => {
  const template = {
    id: templateName,
    params: { size: limit, from: skip, query, sort, ...params },
    source: { size: limit, from: skip, sort, query: { bool } },
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
  } catch (err: unknown) {
    const error = err as ICustomError;
    if (error.type !== 'index_not_found_exception') {
      ctx.logger.error(`Failed to perform search for: "${templateName}"`);
    }
    const cause = error.body?.error?.root_cause?.[0];
    cause && ctx.logger.debug(cause);
    if (error.body?.error?.type === 'json_parse_exception') {
      ctx.logger.info(`Search template ${templateName} is invalid`);
    }
    ctx.logger.error(error);
    return null;
  }
};

export const count = async (
  ctx: Context,
  templateName: string,
  indexName: string,
  { value, query }: ICountParams = {},
): Promise<IESCount | null> => {
  const isAuditLogTemplate = templateName === TENANT_INDEX.auditLogs;
  const esClient = isAuditLogTemplate ? getAuditLogClient(ctx) : getClient(ctx);

  try {
    const results = await esClient.count({
      index: indexName,
      body: query,
    });

    const result = {
      status: value,
      count: results?.body?.count || 0,
    };

    return result;
  } catch (err: unknown) {
    const error = err as ICustomError;
    if (error.type !== 'index_not_found_exception') {
      ctx.logger.error(`Failed to perform search for: "${templateName}"`);
    }
    const cause = error.body?.error?.root_cause?.[0];
    cause && ctx.logger.debug(cause);
    if (error.body?.error?.type === 'json_parse_exception') {
      ctx.logger.info(`Search template ${templateName} is invalid`);
    }
    ctx.logger.error(error);
    return null;
  }
};
