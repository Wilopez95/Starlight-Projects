import elasticsearch from '@opensearch-project/opensearch';
import camelCase from 'lodash/fp/camelCase.js';
import pickBy from 'lodash/pickBy.js';
import isNil from 'lodash/isNil.js';

import { logger } from '../../utils/logger.js';

import { AUDIT_LOGS_ELASTIC_URL, AUDIT_LOGS_ELASTIC_PORT } from '../../config.js';

const { Client } = elasticsearch;
const DEFAULT_LIMIT = 5;

const clean = document => pickBy(document, v => !isNil(v) && !Number.isNaN(v) && v !== '');

let auditLogClient;

export const getAuditLogClient = () => {
  if (!auditLogClient) {
    try {
      auditLogClient = new Client({
        node: `${AUDIT_LOGS_ELASTIC_URL}:${AUDIT_LOGS_ELASTIC_PORT}`,
        ssl: { rejectUnauthorized: false },
      });
    } catch (error) {
      logger.error('ES [al] connection cannot be established');
      throw error;
    }
  }
  return auditLogClient;
};

export const applyTenantToIndex = (indexName, tenant) => `${indexName}__${tenant}`;

export const indexAlDocument = (indexName, document) =>
  getAuditLogClient().index({
    body: clean(document),
    refresh: false,
    index: indexName,
  });

export const search = async (
  templateName,
  indexName,
  { query, limit = DEFAULT_LIMIT, skip = 0, ...params } = {},
) => {
  const template = {
    id: templateName,
    params: { size: limit, from: skip, query, ...params },
  };

  try {
    const results = await getAuditLogClient().searchTemplate({
      index: indexName,
      body: template,
    });

    return {
      [camelCase(templateName)]:
        results?.body?.hits?.hits?.map(hit => ({
          ...hit._source,
          id: hit._id,
          highlight: hit.highlight,
        })) || [],
    };
  } catch (error) {
    if (error?.type !== 'index_not_found_exception') {
      logger.error(`Failed to perform search for: "${templateName}"`);
    }
    const cause = error?.body?.error?.root_cause?.[0];
    cause && logger.debug(cause);
    if (error?.body?.error?.type === 'json_parse_exception') {
      logger.info(`Search template ${templateName} is invalid`);
    }
    logger.error(error);
    return {};
  }
};
