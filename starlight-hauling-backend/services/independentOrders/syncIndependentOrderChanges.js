import WorkOrderRepo from '../../repos/v2/workOrder.js';
import InventoryRepo from '../../repos/inventory/inventory.js';
import OrderRepo from '../../repos/v2/order.js';

import { unDeferredPaymentByOrderId, getDeferredPaymentOrders } from '../billing.js';
import { syncOrderTotals } from '../billingProcessor.js';
import { publishers } from '../routePlanner/publishers.js';

import { ORDER_STATUS, ORDER_STATUSES } from '../../consts/orderStatuses.js';

const syncIndependentOrderChanges = async (ctx, { order, ...params }) => {
  ctx.logger.debug(`syncIndependentOrderChanges->order: ${JSON.stringify(order, null, 2)}`);
  ctx.logger.debug(`syncIndependentOrderChanges->params: ${JSON.stringify(params, null, 2)}`);

  const woRepo = WorkOrderRepo.getInstance(ctx.state);
  const inventoryRepo = InventoryRepo.getInstance(ctx.state);

  const {
    syncWithDispatch = null,
    syncWithRoutePlanner = null,
    syncTotalsWithBilling = false,
    syncUnDeferredPaymentsWithBilling = false,
    syncWithRecycling = false,
    syncInventory = false,
  } = params;
  const { id: orderId } = order;
  const woNumber = order.workOrder?.woNumber;

  let nonCanceledOrders = [];
  if (syncUnDeferredPaymentsWithBilling) {
    const relatedOrders = await getDeferredPaymentOrders(ctx, { orderId });
    nonCanceledOrders = await OrderRepo.getInstance(ctx.state).getByIdsAndStatuses({
      ids: relatedOrders.map(({ id }) => id),
      statuses: ORDER_STATUSES.filter(element => element !== ORDER_STATUS.canceled),
      fields: ['id', 'grandTotal'],
    });
  }

  try {
    await Promise.all([
      syncTotalsWithBilling
        ? syncOrderTotals(ctx, {
            schemaName: ctx.state.schemaName,
            orderId,
            serviceDate: order.serviceDate,
            grandTotal: order.grandTotal,
            onAccountTotal: order.onAccountTotal,
            surchargesTotal: order.surchargesTotal,
            beforeTaxesTotal: order.beforeTaxesTotal,
            overrideCreditLimit: Boolean(order.overrideCreditLimit),
          })
        : null,
      syncUnDeferredPaymentsWithBilling
        ? unDeferredPaymentByOrderId(ctx, {
            orderId,
            data: { orderGrandTotal: order.grandTotal, nonCanceledOrders },
          })
        : null,
      syncWithDispatch
        ? woRepo.dispatchUpdates({
            condition: { woNumber },
            data: syncWithDispatch,
          })
        : null,
      syncWithRoutePlanner
        ? publishers.syncIndependentToDispatch(
            { state: ctx.state, logger: ctx.state.logger },
            {
              schemaName: ctx.state.schemaName,
              userId: ctx.state.userId,
              independentWorkOrders: [syncWithRoutePlanner],
            },
          )
        : null,
      syncWithRecycling ? woRepo.syncWoUpdatesWithRecycling(syncWithRecycling) : null,
      syncInventory ? inventoryRepo.updateInventoryByOrderInfo(order) : null,
    ]);
  } catch (error) {
    ctx.logger.error(error, `Error while synchronizing changes for order with id ${orderId}`);
    throw error;
  }
};

export default syncIndependentOrderChanges;
