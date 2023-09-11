import { isPast, isToday } from 'date-fns';
import pick from 'lodash/fp/pick.js';

import knex from '../../db/connection.js';

import OrderRepo from '../../repos/v2/order.js';
import IndependentWorkOrderRepository from '../../repos/independentWorkOrder.js';
import WorkOrderRepo from '../../repos/v2/workOrder.js';

import applySurcharges from '../pricesCalculation/order/surcharges/applySurcharges.js';
import calculateTaxes from '../pricesCalculation/order/taxes/calculateTaxes.js';
import calculateSummary from '../pricesCalculation/order/summary/calculateSummary.js';
import { getPrepaidOrDeferredPaymentsByOrder } from '../billing.js';

import {
  prefixFieldsWithRefactoredDeep,
  prefixKeyWithRefactored,
  replaceLegacyWithRefactoredFieldsDeep,
} from '../../utils/priceRefactoring.js';
import validateBestTimeToComeRange from '../../utils/validateBestTimeToComeRange.js';

import { orderNotFound } from '../../errors/orderErrorMessages.js';
import ApiError from '../../errors/ApiError.js';

import { ORDER_STATUS } from '../../consts/orderStatuses.js';
import { ORDER_FIELDS_FOR_WOS } from '../../consts/independentWorkOrder.js';
import { PAYMENT_STATUS } from '../../consts/paymentStatus.js';
import { PAYMENT_METHOD } from '../../consts/paymentMethods.js';
import getWorkOrderDataToEditOrder from './getWorkOrderDataToEditOrder.js';
import assertServiceDateValid from './utils/assertServiceDateValid.js';
import syncIndependentOrderChanges from './syncIndependentOrderChanges.js';
import addTripCharge from './addTripCharge.js';

const ORDER_FIELDS_TO_SYNC_WITH_DISPATCH = [
  'serviceDate',
  'purchaseOrderId',
  'driverInstructions',
  'earlyPick',
  'toRoll',
  'someoneOnSite',
  'highPriority',
  'customerJobSiteId',
  'callOnWayPhoneNumber',
  'textOnWayPhoneNumber',
  'billableServiceId',
  'equipmentItemId',
  'materialId',
  'disposalSiteId',
  'permitId',
  'orderContactId',
  'jobSite2Id',
];

const reScheduleIndependentOrder = async (
  ctx,
  { data, concurrentData, fields = [], noSyncWithDispatch = false, applyTaxes = true, log = true },
  trx,
) => {
  ctx.logger.debug(`reScheduleIndependentOrder->data: ${JSON.stringify(data, null, 2)}`);
  const {
    id,
    serviceDate,
    bestTimeToComeFrom,
    bestTimeToComeTo,
    comment,
    addTripCharge: mustAddTripCharge,
  } = data;

  const orderRepo = OrderRepo.getInstance(ctx.state);
  const woRepo = WorkOrderRepo.getInstance(ctx.state);
  const indWoRepo = IndependentWorkOrderRepository.getInstance(ctx.state);

  const _trx = trx || (await knex.transaction());
  try {
    const condition = { id };
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
            'status',
          ].map(prefixKeyWithRefactored),
        },
        _trx,
      ),
    );
    ctx.logger.debug(`reScheduleIndependentOrder->oldOrder: ${JSON.stringify(oldOrder, null, 2)}`);

    if (!oldOrder) {
      throw orderNotFound(id);
    }
    if (oldOrder.status !== ORDER_STATUS.inProgress) {
      throw ApiError.invalidRequest('Only InProgress order can be rescheduled');
    }

    const newServiceDate = new Date(serviceDate);
    if (isPast(newServiceDate) && !isToday(newServiceDate)) {
      throw ApiError.invalidRequest('InProgress Order cannot be rescheduled for any past date');
    }
    const payment = await getPrepaidOrDeferredPaymentsByOrder(ctx, {
      orderId: id,
      deferredOnly: true,
    });

    payment?.deferredUntil &&
      payment?.status === PAYMENT_STATUS.deferred &&
      assertServiceDateValid(serviceDate, payment.deferredUntil);

    validateBestTimeToComeRange(bestTimeToComeFrom, bestTimeToComeTo);

    let woNumber;
    if (oldOrder.isRollOff) {
      woNumber = oldOrder.workOrder?.woNumber > 0 ? oldOrder.workOrder.woNumber : null;
    } else {
      woNumber =
        oldOrder.independentWorkOrder?.woNumber > 0 ? oldOrder.independentWorkOrder.woNumber : null;
    }

    const { lineItems = [], thresholds: thresholdItems = [] } = oldOrder;

    if (mustAddTripCharge) {
      const addedLineItems = await addTripCharge(ctx, { order: oldOrder, save: true }, _trx);
      if (addedLineItems.length) {
        const [addedTripCharge] = addedLineItems;
        lineItems.push(addedTripCharge);
      }
    }
    ctx.logger.debug(
      `reScheduleIndependentOrder->lineItems: ${JSON.stringify(lineItems, null, 2)}`,
    );
    ctx.logger.debug(
      `reScheduleIndependentOrder->thresholdItems: ${JSON.stringify(thresholdItems, null, 2)}`,
    );
    const surchargeItems = await applySurcharges(
      ctx,
      {
        order: oldOrder,
        lineItems,
        thresholdItems,
        recalculateExisting: false,
      },
      _trx,
    );
    ctx.logger.debug(
      `reScheduleIndependentOrder->surchargeItems: ${JSON.stringify(surchargeItems, null, 2)}`,
    );

    let summary = calculateSummary({
      order: oldOrder,
      lineItems,
      thresholdItems,
      surchargeItems,
    });
    if (applyTaxes) {
      ctx.logger.debug(
        `reScheduleIndependentOrder->summaryBeforeTaxers: ${JSON.stringify(summary, null, 2)}`,
      );
      const { taxesTotal } = await calculateTaxes(
        ctx,
        {
          order: { ...oldOrder, ...summary, lineItems, thresholds: thresholdItems },
          surcharges: surchargeItems,
        },
        _trx,
      );
      summary = calculateSummary({
        order: oldOrder,
        lineItems,
        thresholdItems,
        surchargeItems,
        taxesTotal,
      });
    }
    ctx.logger.debug(`reScheduleIndependentOrder->summary: ${JSON.stringify(summary, null, 2)}`);

    const newData = {
      serviceDate,
      bestTimeToComeFrom,
      bestTimeToComeTo,
      rescheduleComment: comment || null,

      billableLineItemsTotal: summary.lineItemsTotal,
      thresholdsTotal: summary.thresholdItemsTotal,
      surchargesTotal: summary.surchargeItemsTotal,
      beforeTaxesTotal: summary.orderTotalsWithSurcharges,
      grandTotal: summary.grandTotal,
    };
    if (oldOrder.paymentMethod === PAYMENT_METHOD.onAccount) {
      newData.onAccountTotal = summary.grandTotal;
    }
    ctx.logger.debug(`reScheduleIndependentOrder->newData: ${JSON.stringify(newData, null, 2)}`);

    await orderRepo.updateBy(
      {
        condition,
        data: prefixFieldsWithRefactoredDeep(newData),
        concurrentData,
        fields: ['id'],
        log: false,
      },
      _trx,
    );
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
              'bestTimeToComeFrom',
              'bestTimeToComeTo',
              'status',

              ...ORDER_FIELDS_TO_SYNC_WITH_DISPATCH,
              ...fields,
              ...ORDER_FIELDS_FOR_WOS,
            ]),
          ).map(prefixKeyWithRefactored),
        },
        _trx,
      ),
    );
    ctx.logger.debug(
      `reScheduleIndependentOrder->updatedOrder: ${JSON.stringify(updatedOrder, null, 2)}`,
    );

    if (oldOrder.isRollOff) {
      if (woNumber) {
        await woRepo.updateBy(
          {
            condition: { woNumber },
            data: pick(['bestTimeToComeFrom', 'bestTimeToComeTo'])(updatedOrder),
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
          data: pick(['bestTimeToComeFrom', 'bestTimeToComeTo'])(updatedOrder),
        },
        _trx,
      );
    }

    if (!trx) {
      await _trx.commit();

      log && orderRepo.log({ id, action: orderRepo.logAction.modify });
    }

    let woInput;
    if (oldOrder.isRollOff) {
      woInput = await getWorkOrderDataToEditOrder(ctx, updatedOrder);
      ctx.logger.debug(`reScheduleIndependentOrder->woInput: ${JSON.stringify(woInput, null, 2)}`);
    }
    await syncIndependentOrderChanges(ctx, {
      order: updatedOrder,
      syncWithDispatch: oldOrder.isRollOff && !noSyncWithDispatch ? woInput : null,
      syncWithRoutePlanner:
        !oldOrder.isRollOff && !noSyncWithDispatch
          ? {
              orderId: id,
              independentWorkOrderId: updatedOrder.independentWorkOrder.id,
              ...pick(['serviceDate', 'bestTimeToComeFrom', 'bestTimeToComeTo'])(updatedOrder),
            }
          : null,
      syncTotalsWithBilling: true,
    });

    return pick(fields)(updatedOrder);
  } catch (error) {
    if (!trx) {
      await _trx.rollback();
    }
    ctx.logger.error(error, `Error while re-scheduling order with id ${id}`);
    throw error;
  }
};

export default reScheduleIndependentOrder;
