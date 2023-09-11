import { Client, ClientOptions } from '@elastic/elasticsearch';
import { isNil, pickBy } from 'lodash';
import { ELASTICSEARCH_DISABLE_SSL, ELASTICSEARCH_HOST } from '../config';
import BaseEntity from '../entities/BaseEntity';

export interface UpdateRequestBody<T> {
  doc: T;
}

export interface BulkResponse {
  body: {
    errors: boolean;
    items: Array<{
      _index: string;
      _type: string;
      _id: string;
      error: {
        type: string;
        reason: string;
      };
      status: number;
    }>;
  };
}

export interface UpdateByQueryResponse {
  failures: unknown[];
  updated: number;
  took: number;
}

export class ElasticSearch {
  _client?: Client;
  _clientOptions: ClientOptions = {};

  constructor(options: ClientOptions) {
    this._clientOptions = options;
  }

  private createClient(): Client {
    return new Client(this._clientOptions);
  }

  get client(): Client {
    if (!this._client) {
      this._client = this.createClient();
    }

    return this._client;
  }

  async indexExists(index: string): Promise<boolean> {
    const { body } = await this.client.indices.exists({ index });

    return body;
  }

  async indexDocument<T extends BaseEntity>(indexName: string, document: T) {
    await this.client.index({
      body: this._clean(document),
      refresh: false,
      index: indexName,
    });
  }

  _clean<T extends BaseEntity>(document: T) {
    return pickBy(document, (v) => !isNil(v) && !Number.isNaN(v));
  }

  async count(index: string): Promise<number> {
    const { body } = await this.client.count({ index });

    return body.count;
  }

  async createDoc<T extends BaseEntity>(index: string, id: string, entity: T): Promise<void> {
    const { body } = await this.client.exists({ index, id });

    if (!body) {
      await this.client.create<Record<string, unknown>, T>(
        {
          index,
          id,
          body: entity,
          refresh: true,
        },
        {},
      );
    }
  }

  async updateDoc<T extends BaseEntity>(index: string, id: string, entity: T): Promise<void> {
    const { body } = await this.client.exists({ index, id });

    if (body) {
      await this.client.update<Record<string, unknown>, UpdateRequestBody<T>>(
        {
          index,
          id,
          body: { doc: entity },
          refresh: true,
          _source: 'doc',
        },
        {},
      );
    }
  }

  async deleteDoc(index: string, id: string): Promise<void> {
    const { body } = await this.client.exists({ index, id });

    if (body) {
      await this.client.delete(
        {
          index,
          id,
          refresh: true,
        },
        {},
      );
    }
  }
}

const elasticConfig: ClientOptions = {
  node: ELASTICSEARCH_HOST,
  maxRetries: 5,
  requestTimeout: 60000,
};

if (ELASTICSEARCH_DISABLE_SSL === 'true') {
  elasticConfig.ssl = {
    rejectUnauthorized: false,
    requestCert: false,
  };
}

export const elasticSearch = new ElasticSearch(elasticConfig);
