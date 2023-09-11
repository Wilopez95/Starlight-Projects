import isEmpty from 'lodash/isEmpty.js';
import OrderRepo from '../../../repos/order.js';

import knex from '../../../db/connection.js';

import { mapIndependentWorkOrders } from './mappers.js';
import { syncStatusAndUpdateInventory } from './syncStatusAndUpdateInventory.js';
import { updateLineItems } from './updateLineItems.js';

export const subscriber = async (ctx, { independentOrders }) => {
  ctx.logger.debug(
    independentOrders,
    `syncIndependentWosFromDispatch->subscriber->independentOrders`,
  );
  const orderRepo = OrderRepo.getInstance(ctx.state);

  const trx = await knex.transaction();

  // TODO: clarify why there is no media files update
  const { independentWosLineItems, independentWosLineItemsIds, updatedIndependentWos } =
    mapIndependentWorkOrders(independentOrders);

  try {
    await Promise.all(
      updatedIndependentWos.map(({ orderId, serviceDate }) =>
        orderRepo.updateBy({ condition: { id: orderId }, data: { serviceDate } }, trx),
      ),
    );

    if (!isEmpty(independentWosLineItemsIds)) {
      // TODO: integrate new pricing engine
      const lineItems = await updateLineItems(
        { ids: independentWosLineItemsIds, independentWosLineItems },
        { ctx, trx },
      );
      ctx.logger.debug(
        lineItems,
        `syncIndependentWosFromDispatch->subscriber->independentWosLineItems`,
      );
    }

    await syncStatusAndUpdateInventory({ workOrders: updatedIndependentWos }, { ctx, trx });

    await trx.commit();
  } catch (error) {
    await trx.rollback();

    ctx.logger.warn(`Failed to sync Independent Work Orders from Dispatch`);
    ctx.logger.error(error);
  }
};
