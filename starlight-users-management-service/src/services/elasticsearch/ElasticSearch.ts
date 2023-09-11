import { Client } from '@opensearch-project/opensearch';

import { camelCase } from 'lodash/fp';
import { pickBy, isNil } from 'lodash';

import { logger } from '../logger';

import { AUDIT_LOGS_ELASTIC_URL, AUDIT_LOGS_ELASTIC_PORT } from '../../config';

const DEFAULT_LIMIT = 5;

export const TENANT_INDEX = {
  auditLogs: 'audit_logs',
};

export interface SearchResponse {
  hits: {
    total: {
      value: number;
    };
    max_score: number;
    hits: Array<{
      _id: string;
      _source: Record<string, unknown>;
      highlight?: unknown;
    }>;
  };
}

/**
 * It removes all keys from an object whose values are null, undefined, NaN, or an empty string
 * @param document - The document to clean.
 */
const clean = (document: Record<string, unknown>) =>
  pickBy(document, (v) => !isNil(v) && !Number.isNaN(v) && v !== '');

let auditLogClient: Client;

/**
 * It creates a new Elasticsearch client if one doesn't exist, and returns the client
 * @returns A function that returns a Client object.
 */
export const getAuditLogClient = (): Client => {
  if (!auditLogClient) {
    try {
      auditLogClient = new Client({
        node: `${AUDIT_LOGS_ELASTIC_URL as string}:${AUDIT_LOGS_ELASTIC_PORT}`,
        ssl: { rejectUnauthorized: false },
      });
    } catch (error) {
      logger.error('ES [al] connection cannot be established');
      throw error;
    }
  }
  return auditLogClient;
};

/**
 * Given an index name and a tenant, return the index name with the tenant appended to it.
 * @param {string} indexName - The name of the index you want to apply the tenant to.
 * @param {string} tenant - The tenant ID
 */
export const applyTenantToIndex = (indexName: string, tenant: string): string =>
  `${indexName}__${tenant}`;

/**
 * It takes an index name and a document, and indexes the document in the index
 * @param {string} indexName - The name of the index to index the document to.
 * @param document - The document to index.
 */
export const indexAlDocument = async (
  indexName: string,
  document: Record<string, unknown>,
): Promise<void> => {
  await getAuditLogClient().index({
    body: clean(document),
    refresh: false,
    index: indexName,
  });
};

/**
 * It takes a template name, an index name, and a set of parameters, and returns the results of the
 * search
 * @param {string} templateName - The name of the template to use.
 * @param {string} indexName - The name of the index to search.
 * @param  - `templateName` - the name of the template to use
 * @returns An object with the key being the template name and the value being an array of objects.
 */
export const search = async (
  templateName: string,
  indexName: string,
  {
    query,
    offset = 0,
    limit = DEFAULT_LIMIT,
    ...params
  }: Record<string, string | number | boolean> = {},
): Promise<Record<string, Record<string, unknown>[]>> => {
  const template = {
    id: templateName,
    params: { size: limit, from: offset, query, ...params },
  };

  try {
    const results = await getAuditLogClient().searchTemplate<SearchResponse>({
      index: indexName,
      body: template,
    });

    return {
      [camelCase(templateName)]: results.body.hits.hits.map((hit) => ({
        ...hit._source,
        id: hit._id,
        highlight: hit.highlight,
      })),
    };
  } catch (error) {
    // @ts-expect-error not using any
    if (error?.type !== 'index_not_found_exception') {
      logger.error(`Failed to perform search for: "${templateName}"`);
      logger.error(error as Error);
    }
    return {};
  }
};
