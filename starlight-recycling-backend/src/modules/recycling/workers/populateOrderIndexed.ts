import { graphql } from 'graphql';
import { omit } from 'lodash';
import { EventListenerTypes } from '../../../services/observableEntity';
import { elasticSearch } from '../../../services/elasticsearch';
import Order from '../entities/Order';
import OrderIndexed from '../entities/OrderIndexed';
import { createWorker } from './workerWithLogger';
import { QUEUE_NAME, PopulateOrderIndexed } from '../queues/populateOrderIndexed';
import { getFacilityEntitiesAndConnection } from '../utils/facilityConnection';
import logger from '../../../services/logger';
import { v4 as uuidV4 } from 'uuid';
import { generatedSchema } from '../../../graphql/schema';
import { auditLog } from '../../../services/auditLog/auditLog';
import { AUDIT_LOG_ACTION } from '../../../constants/auditLog';
import { postOrderAuditLog } from '../../../services/core/postHaulingAuditLog';
import { extendOrderHistory } from './utils/extendOrderHistory';
import { QueryContext } from '../../../types/QueryContext';
import AuditEntityAction from '../../../entities/AuditEntityAction';

const getOrderQuery = `
  query GetOrder($id: Int!) {
    order(id: $id) {
      id
      owner
      createdAt
      updatedAt
      arrivedAt
      departureAt
      type
      status
      isSelfService
      WONumber
      PONumber
      weightIn
      weightOut
      paymentMethod
      grandTotal
      haulingOrderId
      customerId
      destinationId
      destination {
        description
      }
      originDistrictId
      originDistrict {
        state
        county
        city
      }
      customer {
        id
        businessName
        selfServiceOrderAllowed
      }
      customerTruckId
      customerTruck {
        id
        truckNumber
        type
        emptyWeight
        description
        active
        licensePlate
      }
      nonCommercialTruckId
      nonCommercialTruck {
        id
        licensePlate
      }
      materialId
      material {
        id
        description
      }
      materialsDistribution {
        materialId
        value
        material {
          description
        }
      }
      miscellaneousMaterialsDistribution {
        materialId
        quantity
        recycle
        material {
          description
        }
      }
      containerId
      container {
        description
      }
      jobSiteId
      jobSite {
        fullAddress
      }
      projectId
      project {
        description
      }
      priceGroupId
      priceGroup {
        description
      }
      images {
        filename
      }
      images {
        filename
      }
      note
      weightScaleUom
    }
  }
`;

export const worker = createWorker<PopulateOrderIndexed>(QUEUE_NAME, async (job) => {
  const { orderId, eventType, indexName, primaryId, resource, ctx, makeAuditLog } = job.data;
  const { schema } = generatedSchema;

  if (!resource) {
    job.info('recyclingSrn is missing');
    job.info('Stop worker');
    await job.updateProgress(100);

    return;
  }

  if (!orderId) {
    job.info('OrderId is missing');
    job.info('Stop worker');
    await job.updateProgress(100);

    return;
  }

  job.info(`Fetch order (${orderId}) data`);

  const [, connectionEntities] = await getFacilityEntitiesAndConnection(resource);

  const contextValue = {
    userInfo: {
      firstName: ctx.userInfo.firstName,
      lastName: ctx.userInfo.lastName,
      resource,
    },
    reqId: uuidV4(),
    ...connectionEntities,
  } as QueryContext;

  const { data, errors } = await graphql({
    schema,
    source: getOrderQuery,
    contextValue: {
      ...contextValue,
      isWorker: true,
      log: logger,
    },
    variableValues: {
      id: orderId,
    },
  });

  if (errors) {
    job.info('Error on fetching graphql data');
    job.error(errors);
    job.info('Stop worker');
    await job.updateProgress(100);

    if (errors[0].originalError?.name === 'EntityNotFound') {
      await elasticSearch.deleteDoc(indexName, primaryId);
    }

    return;
  }

  if (!data) {
    return;
  }

  const indexedOrder = new OrderIndexed(data.order as Order);
  try {
    switch (eventType) {
      case EventListenerTypes.AFTER_INSERT:
        await extendOrderHistory({
          order: data.order,
          ctx: contextValue,
          action: AuditEntityAction.CREATE,
        });
        await elasticSearch.createDoc(indexName, primaryId, {
          ...omit(indexedOrder, '_userInfo'),
        } as OrderIndexed);

        await auditLog.makeRecord(ctx, indexedOrder, {
          id: indexedOrder.id,
          entity: Order,
          action: AUDIT_LOG_ACTION.CREATE,
        });

        job.info('Order created in elasticsearch');

        break;

      case EventListenerTypes.AFTER_UPDATE:
        await extendOrderHistory({
          order: data.order,
          ctx: contextValue,
          action: AuditEntityAction.UPDATE,
        });
        await elasticSearch.updateDoc(indexName, primaryId, {
          ...omit(indexedOrder, '_userInfo'),
        } as OrderIndexed);

        job.info('Order updated in elasticsearch');

        if (makeAuditLog) {
          const { data } = await auditLog.makeRecord(ctx, indexedOrder, {
            id: indexedOrder.id,
            entity: Order,
            action: AUDIT_LOG_ACTION.MODIFY,
          });

          if (indexedOrder.haulingOrderId) {
            setTimeout(() => {
              postOrderAuditLog(data, AUDIT_LOG_ACTION.MODIFY, {
                resource,
                userId: ctx.userInfo.id,
                requestId: ctx.reqId,
              });
            }, 5000);
          }
        }

        break;

      case EventListenerTypes.BEFORE_REMOVE:
        await extendOrderHistory({
          order: data.order,
          ctx: contextValue,
          action: AuditEntityAction.REMOVE,
        });
        await elasticSearch.deleteDoc(indexName, primaryId);

        job.info('Order removed from elasticsearch');

        await auditLog.makeRecord(ctx, indexedOrder, {
          id: indexedOrder.id,
          entity: Order,
          action: AUDIT_LOG_ACTION.DELETE,
        });

        break;
    }
  } catch (e) {
    job.info(`Couldn't populate history or elasticsearch index for Order`);
    job.info(JSON.stringify(e));

    job.info('Stop worker');
    await job.updateProgress(100);

    return;
  }

  job.info('shouldcreatedocument');
  job.info('Stop worker');
  await job.updateProgress(100);

  return;
});
