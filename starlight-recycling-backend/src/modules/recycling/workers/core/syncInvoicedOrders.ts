import { invoicedOrdersObservable } from '../../../../services/core/haulingOrder';
import { createFacilitySrn } from '../../../../utils/srn';
import { getFacilityEntitiesAndConnection } from '../../utils/facilityConnection';
import Order, { OrderStatus } from '../../entities/Order';
import { In } from 'typeorm';
import { createLogger } from '../../../../services/logger';
import { AMQP_QUEUE_INVOICED_ORDERS_TO_RECYCLING } from '../../../../config';
import { updateElasticHaulingOrdersByQuery } from '../../graphql/resolvers/utils/updateElasticOrderByQuery';
import { Context } from '../../../../types/Context';
import getContextualizedEntity from '../../../../utils/getContextualizedEntity';

const logger = createLogger({
  prettyPrint: {
    messageFormat: 'queue={queue} - {msg} ',
  },
}).child({
  queue: AMQP_QUEUE_INVOICED_ORDERS_TO_RECYCLING,
});

invoicedOrdersObservable.subscribe(async (invoicedOrdersEvent) => {
  const { schemaName, orderIds, businessUnitId, userId } = invoicedOrdersEvent;

  logger.info('Start');

  const srn = createFacilitySrn({ tenantName: schemaName, businessUnitId });

  const [, connectionEntities] = await getFacilityEntitiesAndConnection(srn);
  const ctx = {
    userInfo: {
      id: userId,
      resource: srn,
    },
    log: logger,
    ...connectionEntities,
  } as Context;
  const ContextualizedOrder = getContextualizedEntity(Order)(ctx);

  try {
    logger.info('DB update');
    await ContextualizedOrder.createQueryBuilder()
      .update()
      .set({ status: OrderStatus.INVOICED })
      .where({
        haulingOrderId: In(orderIds),
      })
      .execute();

    logger.info('Elastic update');
    await updateElasticHaulingOrdersByQuery(ctx, OrderStatus.INVOICED, orderIds);
  } catch (e) {
    logger.error(e, 'Failed to invoice orders');
  }

  logger.info('Finish');
});
