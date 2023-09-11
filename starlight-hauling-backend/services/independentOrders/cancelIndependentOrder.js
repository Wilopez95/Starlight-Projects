import pick from 'lodash/fp/pick.js';

import knex from '../../db/connection.js';

import OrderRepo from '../../repos/v2/order.js';
import IndependentWorkOrderRepository from '../../repos/independentWorkOrder.js';
import WorkOrderRepo from '../../repos/v2/workOrder.js';
import LineItemRepo from '../../repos/v2/lineItem.js';
import ThresholdItemRepo from '../../repos/v2/thresholdItem.js';

import applySurcharges from '../pricesCalculation/order/surcharges/applySurcharges.js';
import calculateSummary from '../pricesCalculation/order/summary/calculateSummary.js';
import calculateTaxes from '../pricesCalculation/order/taxes/calculateTaxes.js';

import {
  prefixFieldsWithRefactoredDeep,
  prefixKeyWithRefactored,
  replaceLegacyWithRefactoredFieldsDeep,
} from '../../utils/priceRefactoring.js';

import { orderNotFound } from '../../errors/orderErrorMessages.js';

import { ORDER_STATUS } from '../../consts/orderStatuses.js';
import { INDEPENDENT_WO_STATUS, ORDER_FIELDS_FOR_WOS } from '../../consts/independentWorkOrder.js';
import { WO_STATUS } from '../../consts/workOrder.js';
import { LINE_ITEM_TYPE } from '../../consts/lineItemTypes.js';
import { PAYMENT_METHOD } from '../../consts/paymentMethods.js';
import syncIndependentOrderChanges from './syncIndependentOrderChanges.js';
import addTripCharge from './addTripCharge.js';

export const cancelIndependentOrder = async (
  ctx,
  {
    data,
    concurrentData,
    fields = [],
    applyTaxes = true,
    noSyncWithDispatch = false,
    fromRoutePlanner = false,
    log = true,
  },
  trx,
) => {
  ctx.logger.debug(`cancelIndependentOrder->data: ${JSON.stringify(data, null, 2)}`);
  const { id, reasonType, comment, addTripCharge: mustAddTripCharge } = data;

  const orderRepo = OrderRepo.getInstance(ctx.state);
  const woRepo = WorkOrderRepo.getInstance(ctx.state);
  const indWoRepo = IndependentWorkOrderRepository.getInstance(ctx.state);
  const lineItemRepo = LineItemRepo.getInstance(ctx.state);
  const thresholdItemRepo = ThresholdItemRepo.getInstance(ctx.state);

  const _trx = trx || (await knex.transaction());
  try {
    const condition = { id };
    if (!fromRoutePlanner) {
      condition.status = ORDER_STATUS.inProgress;
    }
    const oldOrder = replaceLegacyWithRefactoredFieldsDeep(
      await orderRepo.getBy(
        {
          condition,
          fields: [
            'id',
            'businessUnitId',
            'businessLineId',
            'customerId',
            'jobSiteId',
            'customerJobSiteId',
            'materialId',
            'priceGroupId',
            'serviceDate',
            'applySurcharges',
            'isRollOff',
            'workOrderId',

            'beforeTaxesTotal',
            'billableServiceId',
            'lineItems',
            'thresholds',
            'paymentMethod',
            'onAccountTotal',
          ].map(prefixKeyWithRefactored),
        },
        _trx,
      ),
    );
    ctx.logger.debug(`cancelIndependentOrder->oldOrder: ${JSON.stringify(oldOrder, null, 2)}`);

    if (!oldOrder) {
      throw orderNotFound(id, fromRoutePlanner ? undefined : ORDER_STATUS.inProgress);
    }

    let woNumber;
    if (oldOrder.isRollOff) {
      woNumber = oldOrder.workOrder?.woNumber > 0 ? oldOrder.workOrder.woNumber : null;
    } else {
      woNumber =
        oldOrder.independentWorkOrder?.woNumber > 0 ? oldOrder.independentWorkOrder.woNumber : null;
    }

    const { lineItemsToDeleteIds, lineItemsToKeep } = (oldOrder.lineItems || []).reduce(
      (res, item) => {
        const {
          billableLineItem: { type },
        } = item;
        if (
          [
            LINE_ITEM_TYPE.tripCharge, // TODO: clarify this list with BA
          ].includes(type)
        ) {
          res.lineItemsToKeep.push(item);
        } else {
          res.lineItemsToDeleteIds.push(item.id);
        }
        return res;
      },
      { lineItemsToDeleteIds: [], lineItemsToKeep: [] },
    );
    const thresholdItemsToDeleteIds = (oldOrder.thresholds || []).map(item => item.id);

    if (mustAddTripCharge) {
      const addedLineItems = await addTripCharge(ctx, { order: oldOrder, save: true }, _trx);
      if (addedLineItems.length) {
        const [addedTripCharge] = addedLineItems;
        lineItemsToKeep.push(addedTripCharge);
      }
    }
    const cancelledOrder = {
      ...oldOrder,
      billableServicePrice: 0,
      billableServiceTotal: 0,
      applySurcharges: false,
    };
    ctx.logger.debug(
      `cancelIndependentOrder->lineItemsToKeep: ${JSON.stringify(lineItemsToKeep, null, 2)}`,
    );

    const surchargeItems = await applySurcharges(
      ctx,
      {
        order: cancelledOrder,
        lineItems: lineItemsToKeep,
        thresholdItems: [],
        recalculateExisting: true,
      },
      _trx,
    );
    ctx.logger.debug(
      `cancelIndependentOrder->surchargeItems: ${JSON.stringify(surchargeItems, null, 2)}`,
    );

    let summary = calculateSummary({
      order: cancelledOrder,
      lineItems: lineItemsToKeep,
      thresholdItems: [],
      surchargeItems,
    });
    if (applyTaxes) {
      ctx.logger.debug(
        `cancelIndependentOrder->summaryBeforeTaxers: ${JSON.stringify(summary, null, 2)}`,
      );
      const { taxesTotal } = await calculateTaxes(
        ctx,
        {
          order: { ...cancelledOrder, ...summary, lineItems: lineItemsToKeep, thresholds: [] },
          surcharges: surchargeItems,
        },
        _trx,
      );
      summary = calculateSummary({
        order: cancelledOrder,
        lineItems: lineItemsToKeep,
        thresholdItems: [],
        surchargeItems,
        taxesTotal,
      });
    }
    ctx.logger.debug(`cancelIndependentOrder->summary: ${JSON.stringify(summary, null, 2)}`);

    const newData = {
      status: ORDER_STATUS.canceled,

      cancellationReasonType: reasonType || null,
      cancellationComment: comment || null,

      // Set prices to zero.
      billableServicePrice: 0,
      billableServiceTotal: 0,
      billableLineItemsTotal: summary.lineItemsTotal,
      thresholdsTotal: summary.thresholdItemsTotal,
      surchargesTotal: summary.surchargeItemsTotal,
      beforeTaxesTotal: summary.orderTotalsWithSurcharges,
      grandTotal: summary.grandTotal,
    };
    if (oldOrder.paymentMethod === PAYMENT_METHOD.onAccount) {
      newData.onAccountTotal = summary.grandTotal;
    }
    ctx.logger.debug(`cancelIndependentOrder->newData: ${JSON.stringify(newData, null, 2)}`);

    await Promise.all([
      orderRepo.updateBy(
        {
          condition,
          data: prefixFieldsWithRefactoredDeep(newData),
          concurrentData,
          fields: ['id'],
          log: false,
        },
        _trx,
      ),
      lineItemRepo.deleteByIds({ ids: lineItemsToDeleteIds }, _trx),
      thresholdItemRepo.deleteByIds({ ids: thresholdItemsToDeleteIds }, _trx),
    ]);
    const updatedOrder = replaceLegacyWithRefactoredFieldsDeep(
      await orderRepo.getBy(
        {
          condition,
          fields: Array.from(
            new Set([
              'id',
              'grandTotal',
              'onAccountTotal',
              'surchargesTotal',
              'beforeTaxesTotal',
              'lineItems',
              'overrideCreditLimit',
              'workOrderId',
              'independentWorkOrderId',
              ...fields,
              ...ORDER_FIELDS_FOR_WOS,
            ]),
          ).map(prefixKeyWithRefactored),
        },
        _trx,
      ),
    );
    ctx.logger.debug(
      `cancelIndependentOrder->updatedOrder: ${JSON.stringify(updatedOrder, null, 2)}`,
    );

    if (oldOrder.isRollOff) {
      if (woNumber) {
        await woRepo.updateBy(
          {
            condition: { woNumber },
            data: { status: WO_STATUS.canceled },
          },
          _trx,
        );
      }
    } else {
      await indWoRepo.updateBy(
        {
          condition: {
            id: updatedOrder.independentWorkOrder?.id,
          },
          data: { status: INDEPENDENT_WO_STATUS.canceled },
        },
        _trx,
      );
    }

    if (!trx) {
      await _trx.commit();

      log && orderRepo.log({ id, action: orderRepo.logAction.modify });
    }

    await syncIndependentOrderChanges(ctx, {
      order: updatedOrder,
      syncWithDispatch:
        oldOrder.isRollOff && !noSyncWithDispatch ? { status: WO_STATUS.canceled } : null,
      syncWithRoutePlanner:
        !oldOrder.isRollOff && !noSyncWithDispatch
          ? {
              orderId: id,
              independentWorkOrderId: updatedOrder.independentWorkOrder.id,
              status: INDEPENDENT_WO_STATUS.canceled,
            }
          : null,
      syncTotalsWithBilling: true,
      syncUnDeferredPaymentsWithBilling: true,
      syncWithRecycling: oldOrder.isRollOff
        ? {
            woNumber,
            haulingOrderId: id,
            eventName: 'canceled',
          }
        : null,
    });

    return pick(fields)(updatedOrder);
  } catch (error) {
    if (!trx) {
      await _trx.rollback();
    }
    ctx.logger.error(error, `Error while cancelling order with id ${id}`);
    throw error;
  }
};
