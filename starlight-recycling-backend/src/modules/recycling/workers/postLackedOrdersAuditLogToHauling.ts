import { isEqual, omit } from 'lodash';
import { createWorker } from './workerWithLogger';
import logger from '../../../services/logger';
import {
  PostOrderAuditLogToHaulingEvent,
  QUEUE_NAME,
} from '../queues/postLackedOrdersAuditLogToHauling';
import { AuditLog } from '../../../services/auditLog/auditLog';
import { elasticSearch } from '../../../services/elasticsearch';
import bodybuilder from 'bodybuilder';
import { getFacilityEntitiesAndConnection } from '../utils/facilityConnection';
import { postOrderAuditLog } from '../../../services/core/postHaulingAuditLog';

export const worker = createWorker<PostOrderAuditLogToHaulingEvent>(QUEUE_NAME, async (job) => {
  const { recyclingOrderId, entityName, resource, haulingOrderId, userId, requestId } = job.data;

  if (!recyclingOrderId) {
    job.info('OrderId is missing');
    job.info('Stop worker');
    await job.updateProgress(100);

    return;
  }

  try {
    const [connection] = await getFacilityEntitiesAndConnection(resource);
    const metadata = connection.getMetadata(entityName);

    const auditLogIndex = AuditLog.getIndexName(resource, metadata.tableName);

    const qb = bodybuilder()
      .size(1000)
      .filter('term', 'entityId', recyclingOrderId)
      .sort('timestamp', 'desc');

    const body = qb.build();

    const {
      body: {
        hits: { hits: result },
      },
    } = await elasticSearch.client.search<any>({
      index: auditLogIndex,
      body: body,
    });

    const uniqDocuments = result.reduce((res: any[], curr: any, index: number) => {
      if (
        index === 0 ||
        curr._source.action !== result[index - 1]._source.action ||
        !isEqual(
          omit(curr._source.data, 'updatedAt'),
          omit(result[index - 1]._source.data, 'updatedAt'),
        )
      ) {
        res.push(curr);
      }

      return res;
    }, []);

    // todo: make bulk post at hauling, reported by oleh.hrinishyn
    await Promise.all(
      uniqDocuments.map((document: any) =>
        postOrderAuditLog(
          {
            ...document._source.data,
            haulingOrderId,
          },
          document._source.action,
          {
            resource,
            userId,
            requestId,
          },
        ),
      ),
    );
  } catch (e) {
    logger.error(e.response?.data || e, e.message);

    if (e.response?.data) {
      job.error(e.response?.data);
    }
    job.error(e);
  }

  job.info('Stop worker');
  await job.updateProgress(100);

  return;
});
