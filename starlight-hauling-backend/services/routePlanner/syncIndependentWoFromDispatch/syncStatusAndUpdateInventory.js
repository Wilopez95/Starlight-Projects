import OrderRepo from '../../../repos/order.js';
import InventoryRepo from '../../../repos/inventory/inventory.js';
import IndependentWorkOrderRepo from '../../../repos/independentWorkOrder.js';

import { cancelIndependentOrder } from '../../independentOrders/cancelIndependentOrder.js';
import { syncOrderTotals } from '../../billingProcessor.js';

import { ORDER_STATUS } from '../../../consts/orderStatuses.js';
import { REASON_TYPE } from '../../../consts/cancelReasons.js';
import { INDEPENDENT_WO_STATUS } from '../../../consts/independentWorkOrder.js';

const triggeredStatus = [INDEPENDENT_WO_STATUS.completed, INDEPENDENT_WO_STATUS.canceled];

export const syncStatusAndUpdateInventory = async ({ workOrders }, { ctx, trx }) => {
  const orderRepo = OrderRepo.getInstance(ctx.state);
  const inventoryRepo = InventoryRepo.getInstance(ctx.state);
  const independentWoRepo = IndependentWorkOrderRepo.getInstance(ctx.state);
  const data = workOrders.map(({ orderId, ...items }) => items);

  const updatedWos = await independentWoRepo.upsertMany({ data }, trx);

  ctx.logger.debug(
    updatedWos,
    `syncIndependentWosFromDispatch->syncStatusAndUpdateInventory->updatedIndependentWos`,
  );

  for (const { orderId, ...workOrder } of workOrders) {
    const originalOrder = await orderRepo.getBy(
      {
        condition: { id: orderId },
        fields: [
          'id',
          'customerId',
          'businessUnitId',
          'businessLineId',
          'onAccountTotal',
          'status',
        ],
      },
      trx,
    );

    if (triggeredStatus.includes(workOrder.status)) {
      let order;
      delete workOrder.id;

      switch (workOrder.status) {
        case 'CANCELED': {
          order = await cancelIndependentOrder(ctx, {
            data: {
              id: orderId,
              reasonType: REASON_TYPE.other,
              addTripCharge: false, // TODO: confirm with BA
            },
            fields: [
              'grandTotal',
              'beforeTaxesTotal',
              'onAccountTotal',
              'surchargesTotal',
              'overrideCreditLimit',
            ],
            fromRoutePlanner: true,
          });
          break;
        }
        case 'COMPLETED': {
          if (originalOrder.status === ORDER_STATUS.completed) {
            break;
          }

          // TODO: integrate new pricing engine
          order = await orderRepo.completeOne(
            {
              condition: { id: orderId },
              concurrentData: {},
              data: {
                ...originalOrder,
                customerId: originalOrder.customer.originalId,
                status: ORDER_STATUS.completed,
                businessLineId: originalOrder.businessLine.id,
                businessUnitId: originalOrder.businessUnit.id,
                workOrder,
              },
              originalOrder,
              prevServiceId: originalOrder.billableService?.originalId,
              fields: [
                'grandTotal',
                'beforeTaxesTotal',
                'onAccountTotal',
                'overrideCreditLimit',
                'surchargesTotal',
                'businessUnitId',
              ],
              log: true,
            },
            trx,
          );

          // TODO: integrate new pricing engine
          await inventoryRepo.updateInventoryByOrderInfo(order);
          break;
        }
        default: {
          break;
        }
      }

      if (!order) {
        return;
      }
      // TODO: integrate new pricing engine
      const grandTotal = Number(order.grandTotal);
      if (Number(originalOrder.grandTotal) !== grandTotal) {
        await syncOrderTotals(
          ctx,
          {
            schemaName: ctx.state.user.schemaName,
            orderId,
            grandTotal,
            onAccountTotal: Number(order.onAccountTotal),
            beforeTaxesTotal: Number(order.beforeTaxesTotal),
            surchargesTotal: Number(order.surchargesTotal),
          },
          trx,
        );
      }
    }
  }
};
