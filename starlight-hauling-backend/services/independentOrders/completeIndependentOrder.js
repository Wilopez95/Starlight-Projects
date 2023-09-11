import pick from 'lodash/fp/pick.js';
import remove from 'lodash/remove.js';

import knex from '../../db/connection.js';

import OrderRepo from '../../repos/v2/order.js';
import IndependentWorkOrderRepository from '../../repos/independentWorkOrder.js';
import WorkOrderRepo from '../../repos/v2/workOrder.js';
import BillableServiceRepo from '../../repos/billableService.js';
import EquipmentItemRepo from '../../repos/equipmentItem.js';

import applySurcharges from '../pricesCalculation/order/surcharges/applySurcharges.js';
import calculateSummary from '../pricesCalculation/order/summary/calculateSummary.js';
import calculateTaxes from '../pricesCalculation/order/taxes/calculateTaxes.js';

import {
  prefixFieldsWithRefactoredDeep,
  prefixKeyWithRefactored,
  replaceLegacyWithRefactoredFieldsDeep,
} from '../../utils/priceRefactoring.js';

import { orderNotFound } from '../../errors/orderErrorMessages.js';
import ApiError from '../../errors/ApiError.js';

import { ORDER_STATUS } from '../../consts/orderStatuses.js';
import { INDEPENDENT_WO_STATUS, ORDER_FIELDS_FOR_WOS } from '../../consts/independentWorkOrder.js';
import { WO_STATUS } from '../../consts/workOrder.js';
import { PAYMENT_METHOD } from '../../consts/paymentMethods.js';
import { editOrderFields as editOrderFieldsRaw } from '../../consts/orderFields.js';
import updateManifestItems from './updateManifestItems.js';
import updateLineItems from './updateLineItems.js';
import reCalculateThresholds from './reCalculateThresholds.js';
import { checkCreditLimit } from './checkCreditLimit.js';
import getMissingWorkOrderFields from './utils/getMissingWorkOrderFields.js';
import syncIndependentOrderChanges from './syncIndependentOrderChanges.js';

const editOrderFields = editOrderFieldsRaw.map(prefixKeyWithRefactored); // TODO: remove after refactoring

const completeIndependentOrderSyncData = ({
  updatedOrder,
  oldOrder,
  noSyncWithDispatch,
  woNumber,
  id,
}) => {
  return {
    order: updatedOrder,
    syncWithDispatch:
      oldOrder.isRollOff && !noSyncWithDispatch ? { status: WO_STATUS.completed } : null,
    syncWithRoutePlanner:
      !oldOrder.isRollOff && !noSyncWithDispatch
        ? {
            orderId: id,
            independentWorkOrderId: updatedOrder.independentWorkOrder.id,
            status: INDEPENDENT_WO_STATUS.completed,
          }
        : null,
    syncTotalsWithBilling: true,
    syncUnDeferredPaymentsWithBilling: true,
    syncWithRecycling: oldOrder.isRollOff
      ? {
          woNumber,
          haulingOrderId: id,
          eventName: 'completed',
        }
      : null,
    syncInventory: true,
  };
};

export const completeIndependentOrder = async (
  ctx,
  {
    data,
    concurrentData,
    manifestFiles,
    params,
    fields = [],
    noSyncWithDispatch = false,
    log = true,
  },
  trx,
) => {
  ctx.logger.debug(`completeIndependentOrder->data: ${JSON.stringify(data, null, 2)}`);
  ctx.logger.debug(
    `completeIndependentOrder->manifestFiles: ${JSON.stringify(manifestFiles, null, 2)}`,
  );
  ctx.logger.debug(`completeIndependentOrder->params: ${JSON.stringify(params, null, 2)}`);

  const { overrideCreditLimit, isRollOff, noBillableService } = data;
  const { id, applyTaxes = true } = params;

  if (noBillableService) {
    throw ApiError.invalidRequest(
      'An attempt to complete non-billable Order failed since no WO order exists',
      `Order with id ${id} is non-billable so cannot be completed since no WO`,
    );
  }

  // validation stage: required fields
  if (isRollOff) {
    const missingFields = getMissingWorkOrderFields(
      data.workOrder,
      data.action,
      !!data.disposalSiteId,
    );

    if (missingFields) {
      throw ApiError.invalidRequest(
        'WorkOrder should contain all required fields to be completed',
        `WorkOrder should contain required fields ${missingFields.join(', ')}`,
      );
    }
  }

  const orderRepo = OrderRepo.getInstance(ctx.state);
  const woRepo = WorkOrderRepo.getInstance(ctx.state);
  const indWoRepo = IndependentWorkOrderRepository.getInstance(ctx.state);
  const serviceRepo = BillableServiceRepo.getInstance(ctx.state);
  const equipmentRepo = EquipmentItemRepo.getInstance(ctx.state);

  const _trx = trx || (await knex.transaction());
  try {
    const condition = { id, status: ORDER_STATUS.inProgress };
    const oldOrder = replaceLegacyWithRefactoredFieldsDeep(
      await orderRepo.getBy(
        {
          condition,
          fields: editOrderFields,
        },
        _trx,
      ),
    );
    ctx.logger.debug(`completeIndependentOrder->oldOrder: ${JSON.stringify(oldOrder, null, 2)}`);

    if (!oldOrder) {
      throw orderNotFound(id, ORDER_STATUS.inProgress);
    }

    let woNumber;
    if (isRollOff) {
      woNumber = oldOrder.workOrder?.woNumber > 0 ? oldOrder.workOrder.woNumber : null;
    } else {
      woNumber =
        oldOrder.independentWorkOrder?.woNumber > 0 ? oldOrder.independentWorkOrder.woNumber : null;
    }

    if (!woNumber) {
      throw ApiError.invalidRequest('Order with unpaid Deferred Payment cannot be completed');
    }
    oldOrder.equipmentItemId = oldOrder.equipmentItem.id;
    oldOrder.billableServiceId = oldOrder.billableService.originalId;
    const prevServiceId = oldOrder.billableServiceId;
    const [equipmentItemId, lineItems = [], { thresholdsItems: thresholdItems }] =
      await Promise.all([
        'billableServiceId' in data && data.billableServiceId !== prevServiceId
          ? serviceRepo.getById(
              {
                id: data.billableServiceId,
                fields: ['equipmentItemId'],
              },
              _trx,
            )
          : oldOrder.equipmentItemId,
        updateLineItems(ctx, { oldOrder, inputLineItems: data.lineItems }, _trx),
        reCalculateThresholds(
          ctx,
          {
            order: { ...oldOrder, thresholds: data.thresholds },
            workOrder: {
              ...data.workOrder,
              status: WO_STATUS.completed,
            },
          },
          _trx,
        ),
      ]);
    ctx.logger.debug(`completeIndependentOrder->equipmentItemId: ${equipmentItemId}`);
    ctx.logger.debug(`completeIndependentOrder->lineItems: ${JSON.stringify(lineItems, null, 2)}`);
    ctx.logger.debug(
      `completeIndependentOrder->thresholdItems: ${JSON.stringify(thresholdItems, null, 2)}`,
    );

    const { manifestItems, lineItemsToDelete, addedLineItems } = await updateManifestItems(
      ctx,
      {
        oldOrder,
        lineItems,
        manifestItemsToEdit: data.manifestItems,
        manifestItemsToAdd: data.newManifestItems,
        manifestFiles,
        save: true,
      },
      _trx,
    );
    ctx.logger.debug(
      `completeIndependentOrder->manifestItems: ${JSON.stringify(manifestItems, null, 2)}`,
    );
    if (lineItemsToDelete.length) {
      const lineItemsIdsMapToDelete = lineItemsToDelete.reduce((res, { id: lineItemId }) => {
        res[lineItemId] = lineItemId;
        return res;
      }, {});
      remove(lineItems, ({ id: lineItemId }) => lineItemsIdsMapToDelete[lineItemId]);
    }
    if (addedLineItems.length) {
      lineItems.push(...addedLineItems);
    }
    ctx.logger.debug(`completeIndependentOrder->lineItems: ${JSON.stringify(lineItems, null, 2)}`);

    const [equipmentItem, surchargeItems] = await Promise.all([
      equipmentItemId !== oldOrder.equipmentItemId
        ? equipmentRepo.getHistoricalRecordById(
            {
              id: equipmentItemId,
              fields: ['id'],
            },
            _trx,
          )
        : null,
      applySurcharges(
        ctx,
        {
          order: oldOrder,
          lineItems,
          thresholdItems,
          recalculateExisting: true,
        },
        _trx,
      ),
    ]);
    ctx.logger.debug(
      `completeIndependentOrder->equipmentItem: ${JSON.stringify(equipmentItem, null, 2)}`,
    );
    ctx.logger.debug(
      `completeIndependentOrder->surchargeItems: ${JSON.stringify(surchargeItems, null, 2)}`,
    );

    let summary = calculateSummary({
      order: oldOrder,
      lineItems,
      thresholdItems,
      surchargeItems,
    });
    if (applyTaxes) {
      ctx.logger.debug(
        `completeIndependentOrder->summaryBeforeTaxers: ${JSON.stringify(summary, null, 2)}`,
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
    ctx.logger.debug(`completeIndependentOrder->summary: ${JSON.stringify(summary, null, 2)}`);

    await checkCreditLimit(
      ctx,
      {
        order: {
          ...oldOrder,
          customerId: oldOrder.customer.id,
        },
        updateData: {
          overrideCreditLimit: overrideCreditLimit || oldOrder.overrideCreditLimit,
          grandTotal: summary.grandTotal,
        },
      },
      _trx,
    );

    const newData = {
      status: ORDER_STATUS.completed,

      thresholdsTotal: summary.thresholdItemsTotal,
      surchargesTotal: summary.surchargeItemsTotal,
      beforeTaxesTotal: summary.orderTotalsWithSurcharges,
      grandTotal: summary.grandTotal,
    };
    data.paymentMethod === PAYMENT_METHOD.onAccount &&
      (newData.onAccountTotal = summary.grandTotal);
    overrideCreditLimit && (newData.overrideCreditLimit = overrideCreditLimit);
    if (data.billableServiceId !== oldOrder.billableServiceId) {
      newData.billableServiceId = data.billableServiceId;
      equipmentItem && (newData.equipmentItemId = equipmentItem.id);
    }
    ctx.logger.debug(`completeIndependentOrder->newData: ${JSON.stringify(newData, null, 2)}`);

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
              ...fields,
              ...ORDER_FIELDS_FOR_WOS,
            ]),
          ).map(prefixKeyWithRefactored),
        },
        _trx,
      ),
    );
    ctx.logger.debug(
      `completeIndependentOrder->updatedOrder: ${JSON.stringify(updatedOrder, null, 2)}`,
    );

    if (isRollOff) {
      if (woNumber) {
        const { status } = await woRepo.updateWithImages(
          {
            ...data.workOrder,
            status: INDEPENDENT_WO_STATUS.completed,
          },
          _trx,
        );
        ctx.logger.debug(`completeIndependentOrder->wo.status: ${status}`);
      }
    } else {
      // TODO: clarify why there is no media files update
      delete data.workOrder.mediaFiles;
      const { truckId, ...independentWorkOrder } = data.workOrder;
      await indWoRepo.updateBy(
        {
          condition: {
            id: updatedOrder.independentWorkOrder?.id,
          },
          data: {
            ...independentWorkOrder,
            truck: truckId,
            status: INDEPENDENT_WO_STATUS.completed,
          },
        },
        _trx,
      );
    }

    if (!trx) {
      await _trx.commit();

      log && orderRepo.log({ id, action: orderRepo.logAction.modify });
    }
    // pre-pricing service code:
    // await syncIndependentOrderChanges(ctx, {
    //   order: updatedOrder,
    //   syncWithDispatch:
    //     oldOrder.isRollOff && !noSyncWithDispatch ? { status: WO_STATUS.completed } : null,
    //   syncWithRoutePlanner:
    //     !oldOrder.isRollOff && !noSyncWithDispatch
    //       ? {
    //           orderId: id,
    //           independentWorkOrderId: updatedOrder.independentWorkOrder.id,
    //           status: INDEPENDENT_WO_STATUS.completed,
    //         }
    //       : null,
    //   syncTotalsWithBilling: true,
    //   syncUnDeferredPaymentsWithBilling: true,
    //   syncWithRecycling: oldOrder.isRollOff
    //     ? {
    //         woNumber,
    //         haulingOrderId: id,
    //         eventName: 'completed',
    //       }
    //     : null,
    //   syncInventory: true,
    // });
    const dataSyncIndependentOrderChanges = completeIndependentOrderSyncData({
      updatedOrder,
      oldOrder,
      noSyncWithDispatch,
      woNumber,
      id,
    });
    await syncIndependentOrderChanges(ctx, dataSyncIndependentOrderChanges);

    return pick(fields)(updatedOrder);
  } catch (error) {
    if (!trx) {
      await _trx.rollback();
    }
    ctx.logger.error(error, `Error while cancelling order with id ${id}`);
    throw error;
  }
};
