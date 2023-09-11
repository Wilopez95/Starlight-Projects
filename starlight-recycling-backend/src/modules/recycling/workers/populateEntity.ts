import os from 'os';
import * as yup from 'yup';
import { transform, isArray, Dictionary, map, compact, keyBy, pick } from 'lodash';
import { isNumber } from 'lodash';
import { v4 as uuidV4 } from 'uuid';

import { PopulateEntity, QUEUE_NAME } from '../queues/populateEntity';
import { client as redis } from '../../../services/redis';
import { getIndexName, getPrimaryId, elasticSearchEntities } from '../decorators/ElasticSearch';
import { elasticSearch, BulkResponse } from '../../../services/elasticsearch';
import { ELASTICSEARCH_POPULATE_INDEX_PER_PAGE } from '../../../config';
import { createWorker } from './workerWithLogger';
import { getFacilityEntitiesAndConnection } from '../utils/facilityConnection';
import { customerService } from '../../../services/core/haulingCustomer';
import { HaulingHttpCrudService } from '../../../graphql/createHaulingCRUDResolver';
import { Context } from '../../../types/Context';
import { createLogger } from '../../../services/logger';
import { materialService } from '../../../services/core/haulingMaterials';
import { HaulingCustomer } from '../../../services/core/types/HaulingCustomer';
import { HaulingMaterial } from '../../../services/core/types/HaulingMaterial';

const logger = createLogger({
  prettyPrint: {
    messageFormat: 'queue={queue} - {msg} ',
  },
}).child({
  queue: ELASTICSEARCH_POPULATE_INDEX_PER_PAGE,
});

const valueToSchema: (value: unknown, path?: string) => any = (value: unknown, path?: string) => {
  if (typeof value === 'string' || typeof value === 'boolean') {
    return yup.mixed().test({
      name: path,
      params: { value, path },
      message: '${path} not equals ${value}',
      test: (v) => v === value,
    });
  }

  if (typeof value === 'number') {
    return yup.mixed().test({
      name: path,
      params: { value, path },
      message: '${path} not equals ${value}',
      test: (v) => {
        if (typeof v === 'string') {
          try {
            if (v.indexOf('.') >= 0) {
              return parseFloat(v) === value;
            }

            return parseInt(v) === value;
          } catch (_) {
            return false;
          }
        }

        return v === value;
      },
    });
  }

  if (isArray(value)) {
    return yup.mixed().test({
      name: path,
      params: { value, path },
      message: '${path} not equals ${value}',
      test: (v) => {
        return isArray(v) && v.length === value.length && v.every((e) => value.includes(e));
      },
    });
  }

  return yup.object().shape(
    transform(
      value as Dictionary<unknown>,
      (result: any, value, key) => {
        let nextPath = '';

        if (path) {
          nextPath = `${path}.${key}`;
        } else {
          nextPath = `${key}`;
        }
        result[key] = valueToSchema(value, nextPath);

        return result;
      },
      {},
    ),
  );
};

const HOSTNAME = os.hostname();
const EXPIRE_TIME = 60 * 1;

// export const worker = new Worker<Job<PopulateEntity>>(
export const worker = createWorker<PopulateEntity>(QUEUE_NAME, async (job) => {
  const { resource, name, forceReindex } = job.data;

  const lockKey = `lock:${QUEUE_NAME}:${resource}:${name}`;
  const jobLock = await redis.get(lockKey);

  if (jobLock && !forceReindex) {
    job.info(`Job ${job.id} with lock key ${lockKey} is locked`);
    await job.updateProgress(100);

    return;
  }
  await redis.set(lockKey, HOSTNAME, 'ex', EXPIRE_TIME);

  const obj = elasticSearchEntities[name];

  if (!obj) {
    throw new Error('Entity not found');
  }
  const [Entity, IndexedEntity, config] = obj;

  const [connection, connectionEntities] = await getFacilityEntitiesAndConnection(resource);

  const TenantEntity = connectionEntities[Entity.name];
  const metadata = connection.getMetadata(TenantEntity);
  const index = getIndexName(resource, metadata.tableName);
  job.info(`Search index '${index}'`);

  const exists = await elasticSearch.indexExists(index);
  await job.updateProgress(10);

  if (exists) {
    if (!config) {
      job.info('Config is not changed');
      await job.updateProgress(100);

      return;
    }
    const { body } = await elasticSearch.client.indices.get({
      index,
    });
    await job.updateProgress(20);
    job.info('Validating index body');

    try {
      if (forceReindex) {
        throw new Error('Force update index enabled');
      }
      const schema = valueToSchema(config.body);
      await schema.validate(body[index]);
      job.info('Config does not changed');
      await job.updateProgress(100);

      return;
    } catch (e) {
      job.info('Config is changed');
      job.info(JSON.stringify(e));
      job.info('Removing index');
      await job.updateProgress(30);
      await elasticSearch.client.indices.delete({ index });
    }
  }
  await job.updateProgress(40);

  try {
    job.info(`Creating index`);
    await elasticSearch.client.indices.create({
      index,
      body: config?.body,
    });
  } catch (e) {
    job.info(`Failed to create index`);
    job.info(JSON.stringify(e));
    throw e;
  }

  try {
    job.info(`Search ${Entity.name} records`);
    const count = await TenantEntity.count();
    job.info(`Found ${count} entities`);
    await job.updateProgress(50);

    if (count === 0) {
      await job.updateProgress(100);

      return;
    }

    const pageStep = 50 / (Math.floor(count / ELASTICSEARCH_POPULATE_INDEX_PER_PAGE) + 1);
    let page = 0;

    const isOrderEntity = name === 'Order';
    let customersById: Dictionary<HaulingCustomer> | undefined,
      materialsById: Dictionary<HaulingMaterial> | undefined;

    if (isOrderEntity) {
      const ctx = {
        userInfo: {
          resource: resource,
        },
        log: logger,
        resource,
        reqId: uuidV4(),
      } as Context;
      const auth = await HaulingHttpCrudService.getAuthorizationHeader(ctx);
      const { total } = await customerService.count(ctx, undefined, auth);
      const customers = [];
      let page = 1;

      while (customers.length < total) {
        const { data } = await customerService.get(
          ctx,
          undefined,
          { page, perPage: 25 },
          undefined,
          auth,
        );
        customers.push(...data);
        page++;
      }

      const { data: materials } = await materialService.get(
        ctx,
        undefined,
        undefined,
        undefined,
        auth,
      );

      customersById = keyBy(customers, 'id');
      materialsById = keyBy(materials, 'id');
    }

    job.info('Indexing records');
    do {
      const records = await TenantEntity.find({
        relations: config?.includeRelations,
        skip: page * ELASTICSEARCH_POPULATE_INDEX_PER_PAGE,
        take: ELASTICSEARCH_POPULATE_INDEX_PER_PAGE,
      });
      page++;

      const body = records.flatMap((doc) => {
        const indexedDoc = new IndexedEntity(doc);

        if (
          isOrderEntity &&
          customersById &&
          indexedDoc.customerId &&
          customersById[indexedDoc.customerId]
        ) {
          indexedDoc.customer = pick(customersById[indexedDoc.customerId], [
            'id',
            'businessName',
            'selfServiceOrderAllowed',
          ]);
        }

        if (
          isOrderEntity &&
          materialsById &&
          indexedDoc.materialId &&
          materialsById[indexedDoc.materialId]
        ) {
          indexedDoc.material = pick(materialsById[indexedDoc.materialId], ['id', 'description']);
        }

        return [
          { update: { _index: index, _id: getPrimaryId(metadata, doc as any) } },
          { doc: indexedDoc, doc_as_upsert: true },
        ];
      });

      const response: BulkResponse = await elasticSearch.client.bulk({ refresh: true, body });

      if (response.body.errors) {
        const errors = compact(
          map(response.body.items, (item: any) => {
            if (item?.update?.error) {
              return item.update.error;
            }

            return null;
          }),
        );

        job.error(errors, 'Errors from bulk action');

        throw new Error('Failed to bulk refresh');
      }

      if (isNumber(job.progress)) {
        await job.updateProgress(job.progress + pageStep);
      }
    } while (page * ELASTICSEARCH_POPULATE_INDEX_PER_PAGE < count);
  } catch (e) {
    job.info(`Failed to populate entity`);
    job.error(e);

    throw e;
  }
  job.info(`Done`);
});
