import Order, { OrderStatus, OrderType } from '../entities/Order';
import { EventListenerTypes, observeEntity } from '../../../services/observableEntity';
import { delayUntilAfterQueryRunner } from './delayUntilAfterQueryRunner';
import logger from '../../../services/logger';
import { getFacilityEntitiesAndConnection } from '../utils/facilityConnection';
import {
  generateWeightTicketPdf,
  uploadWeightTicket,
} from '../graphql/resolvers/utils/generateWeightTicketPdf';
import { Readable } from 'stream';
import { ReadStream } from 'fs';
import { PRESIGNED_URL_CACHE_KEY_PREFIX } from '../../../config';
import { client as redis } from '../../../services/redis';
import { parseFacilitySrn } from '../../../utils/srn';
import { weightTicketToHauling } from '../../../services/core/weightTicketToHauling';
import { EntitiesMap } from '../../../tenancy/schemaEntities';
import { TenantConnection } from '../../../tenancy';
import { Context } from '../../../types/Context';
import { indexOf } from 'lodash';
import { getCustomer } from '../../../services/core/haulingCustomer';
import { getIndexName, getPrimaryId } from '../decorators/ElasticSearch';
import { elasticSearch, UpdateByQueryResponse } from '../../../services/elasticsearch';

export const init = (): void => {
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
      const [connection, tenantEntities]: [
        TenantConnection,
        EntitiesMap,
      ] = await getFacilityEntitiesAndConnection(resource);

      if (type !== EventListenerTypes.AFTER_UPDATE) {
        return;
      }

      try {
        const TenantOrder = tenantEntities[Order.name] as typeof Order;

        const order = await TenantOrder.findOne(entity.id);
        const ctx: Pick<Context, 'reqId' | 'userInfo' | 'resource'> = {
          userInfo: {
            id: userInfo.id,
            resource: userInfo.resource || '',
            firstName: null,
            lastName: null,
            email: null,
            permissions: [],
            tenantId: userInfo.tenantId,
          },
          reqId: entity._reqId || '',
          resource: userInfo.resource || '',
        };

        if (
          !order ||
          order.type === OrderType.NON_SERVICE ||
          indexOf(
            [
              OrderStatus.COMPLETED,
              OrderStatus.APPROVED,
              OrderStatus.INVOICED,
              OrderStatus.FINALIZED,
            ],
            order.status,
          ) === -1
        ) {
          return;
        }

        const fileBuffer = await generateWeightTicketPdf({ order, ctx });
        order.weightTicketPrivateUrl = await uploadWeightTicket({
          ctx,
          fileReadStream: Readable.from(fileBuffer) as ReadStream,
          orderId: order.id,
        });
        order.weightTicketAttachedAt = new Date();
        order.weightTicketCreatorId = ctx.userInfo.id;

        await TenantOrder.createQueryBuilder()
          .update({
            weightTicketPrivateUrl: order.weightTicketPrivateUrl,
            weightTicketAttachedAt: order.weightTicketAttachedAt,
            weightTicketCreatorId: order.weightTicketCreatorId,
          })
          .whereInIds([order.id])
          .execute();

        const metadata = connection.getMetadata(Order.name);
        const index = getIndexName(resource, metadata.tableName);
        const id = getPrimaryId(metadata, entity);
        await elasticSearch.client.updateByQuery<UpdateByQueryResponse>({
          index: index,
          refresh: true,
          body: {
            script: {
              lang: 'painless',
              source: `ctx._source["hasWeightTicket"] = true`,
            },
            query: {
              term: {
                id: id,
              },
            },
          },
        });
        // delete weight ticket's url key from redis to renew it when next view
        const cacheKey = `${PRESIGNED_URL_CACHE_KEY_PREFIX}${order.weightTicketPrivateUrl}`;
        await redis.del(cacheKey);

        const { tenantName: recyclingTenantName, businessUnitId } = parseFacilitySrn(
          ctx.userInfo.resource || '',
        );

        if (!recyclingTenantName) {
          throw new Error(`Unable to get tenant's name`);
        }

        const customer = await getCustomer(ctx, order.customerId);

        let haulingTenantName = recyclingTenantName;

        if (customer?.haulerSrn) {
          haulingTenantName = parseFacilitySrn(customer?.haulerSrn).tenantName;
        }

        weightTicketToHauling({
          recyclingOrderId: order.id,
          haulingOrderId: order.truckOnWayId || null,
          recyclingTenantName,
          haulingTenantName,
          businessUnitId,
        });
      } catch (e) {
        logger.error(e);
      }
    });
};
