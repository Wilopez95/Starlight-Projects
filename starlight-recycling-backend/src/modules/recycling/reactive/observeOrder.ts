import Order from '../entities/Order';
import { EventListenerTypes, observeEntity } from '../../../services/observableEntity';
import { delayUntilAfterQueryRunner } from './delayUntilAfterQueryRunner';
import logger from '../../../services/logger';
import { getIndexName, getPrimaryId } from '../decorators/ElasticSearch';
import { getFacilityEntitiesAndConnection } from '../utils/facilityConnection';
import { populateOrderIndexedQueue } from '../queues/populateOrderIndexed';
import { editHaulingOrderQueue } from '../queues/editHaulingOrder';
import { Context } from '../../../types/Context';
import { isEqual, omit } from 'lodash';
import { AuditLog } from '../../../services/auditLog/auditLog';
import { UpdateEvent } from 'typeorm';

export const init = () => {
  observeEntity<Order>(Order)
    .pipe(delayUntilAfterQueryRunner<Order>())
    .subscribe(async (event) => {
      const { type, entity } = event;

      if (!entity) {
        return;
      }

      const userInfo = entity._userInfo;

      if (!userInfo) {
        logger.error('Cannot react on changed without userInfo');

        return;
      }

      const { resource } = userInfo;

      if (!resource) {
        logger.error('Resource is not defined');

        return;
      }

      const ctx: Pick<Context, 'reqId' | 'userInfo' | 'resource' | 'logger'> = {
        userInfo: {
          id: userInfo.id,
          resource: userInfo.resource || '',
          firstName: userInfo.firstName || null,
          lastName: userInfo.lastName || null,
          email: userInfo.email || null,
          permissions: [],
          tenantId: userInfo.tenantId,
        },
        reqId: entity._reqId || '',
        resource: userInfo.resource || '',
        logger,
      };

      const [connection] = await getFacilityEntitiesAndConnection(resource);
      const metadata = connection.getMetadata(Order.name);
      const index = getIndexName(resource, metadata.tableName);
      const id = getPrimaryId(metadata, entity);

      const makeAuditLog =
        type === EventListenerTypes.AFTER_UPDATE &&
        !isEqual(
          omit(AuditLog._mapEntityToAuditLog(entity, Order.name), 'updatedAt', 'haulingOrderId'),
          omit(
            AuditLog._mapEntityToAuditLog(
              (event.event as UpdateEvent<Order>).databaseEntity,
              Order.name,
            ),
            'updatedAt',
            'haulingOrderId',
          ),
        );

      await populateOrderIndexedQueue.add('populate-order-indexed', {
        orderId: entity.id,
        eventType: type,
        indexName: index,
        primaryId: id,
        ctx,
        resource,
        makeAuditLog,
      });

      if (type === EventListenerTypes.AFTER_UPDATE && entity.haulingOrderId) {
        editHaulingOrderQueue.add('edit-hauling-order', {
          orderId: entity.id,
          resource,
          userInfo: ctx.userInfo,
          reqId: entity._reqId,
        });
      }
    });
};
