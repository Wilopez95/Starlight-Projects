import { Client } from '@elastic/elasticsearch';
import pickBy from 'lodash/pickBy.js';
import isNil from 'lodash/isNil.js';
import camelCase from 'lodash/camelCase.js';

import { AUDIT_LOGS_ELASTIC_URL, AUDIT_LOGS_ELASTIC_PORT } from '../../config.js';

const DEFAULT_LIMIT = 5;
const INIT_CLIENT_OPTIONS = {
  node: `${AUDIT_LOGS_ELASTIC_URL}:${AUDIT_LOGS_ELASTIC_PORT}`,
  ssl: { rejectUnauthorized: false },
};

class ElasticSearch {
  constructor() {
    this.client = new Client(INIT_CLIENT_OPTIONS);
  }

  async search(
    ctx,
    templateName,
    indexName,
    { query, limit = DEFAULT_LIMIT, skip = 0, ...params } = {},
  ) {
    const template = {
      id: templateName,
      params: { size: limit, from: skip, query, ...params },
    };

    try {
      const results = await this.client.searchTemplate({
        index: indexName,
        body: template,
      });

      const items = results.body.hits;

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
  }

  async indexDocument(ctx, indexName, document) {
    await this.client.index({
      body: this._clean(document),
      refresh: false,
      index: indexName,
    });
  }

  _clean(document) {
    return pickBy(document, v => !isNil(v) && !Number.isNaN(v) && v !== '');
  }
}

export const elasticSearch = new ElasticSearch();
