import httpStatus from 'http-status';

import OrderRepo from '../../../../repos/v2/order.js';
import WorkOrderRepo from '../../../../repos/v2/workOrder.js';
import IndependentWorkOrder from '../../../../repos/independentWorkOrder.js';

import * as billingProcessor from '../../../../services/billingProcessor.js';
import { checkCreditLimit } from '../../../../services/independentOrders/checkCreditLimit.js';
import { cancelIndependentOrder } from '../../../../services/independentOrders/cancelIndependentOrder.js';
import getCompletionData from '../../../../services/independentOrders/utils/getCompletionData.js';
import getMissingWorkOrderFields from '../../../../services/independentOrders/utils/getMissingWorkOrderFields.js';
import { completeIndependentOrder } from '../../../../services/independentOrders/completeIndependentOrder.js';

import { ORDER_STATUS } from '../../../../consts/orderStatuses.js';

import {
  replaceLegacyWithRefactoredFieldsDeep,
  prefixFieldsWithRefactoredDeep,
  prefixKeyWithRefactored,
} from '../../../../utils/priceRefactoring.js';

import ApiError from '../../../../errors/ApiError.js';

const orderNotFound = (id, status) =>
  ApiError.notFound('Order not found', `Order doesn't exist with id ${id} and status ${status}`);

// TODO: integrate new pricing engine
export const syncWithDispatch = async ctx => {
  const { schemaName } = ctx.state.user;
  const { id } = ctx.params;

  const orderRepo = OrderRepo.getInstance(ctx.state);
  const order = await orderRepo.getBy({ condition: { id } });

  if (!order) {
    throw orderNotFound(id);
  }
  if (!order.workOrder) {
    throw ApiError.notFound(
      'An attempt to sync non-billable Order with Dispatch failed since no WO order exists',
      `Order with id ${id} is non-billable so cannot be synced with Dispatch since no WO`,
    );
  }

  const { grandTotal: originalGrandTotal } = order;
  // update synced WO data and calculate thresholds
  const { woOrder, thresholdsTotal, thresholdsItems, newLineItemsTotal, orderData } =
    await WorkOrderRepo.getInstance(ctx.state).syncDataAndCalculateThresholdsAndManifests(order);

  const updatedOrder = await orderRepo.postSyncWithDispatchUpdate({
    order,
    thresholdsTotal,
    thresholdsItems,
    newLineItemsTotal,
    woOrder,
    orderData,
    fields: ['grandTotal', 'onAccountTotal', 'beforeTaxesTotal', 'surchargesTotal'],
    log: true,
  });

  if (Number(originalGrandTotal) !== Number(updatedOrder.grandTotal)) {
    await billingProcessor.syncOrderTotals(ctx, {
      schemaName,
      orderId: id,
      grandTotal: Number(updatedOrder.grandTotal),
      onAccountTotal: Number(updatedOrder.onAccountTotal),
      surchargesTotal: Number(updatedOrder.surchargesTotal),
      beforeTaxesTotal: Number(updatedOrder.beforeTaxesTotal),
    });
  }

  const result = await orderRepo.getBy({ condition: { id } });

  ctx.sendObj(result);
};

export const cancelOrder = async ctx => {
  const { id } = ctx.params;

  await cancelIndependentOrder(ctx, {
    data: {
      id,
      ...ctx.request.validated.body,
    },
  });

  ctx.status = httpStatus.NO_CONTENT;
};

export const completeOrder = async ctx => {
  const { concurrentData } = ctx.state;

  await completeIndependentOrder(ctx, {
    data: ctx.request.validated.body,
    concurrentData,
    params: ctx.params,
    manifestFiles: ctx.request.body?.workOrder?.manifestFiles ?? [],
  });

  ctx.status = httpStatus.OK;
};

export const approveOrder = async ctx => {
  const {
    user: { schemaName },
    concurrentData,
  } = ctx.state;
  const { id } = ctx.params;
  const { overrideCreditLimit, isRollOff, noBillableService } = ctx.request.body;

  const data = getCompletionData(ctx.request.body);

  // Skip validation for noBillableService order.
  if (!noBillableService && isRollOff) {
    const missingFields = getMissingWorkOrderFields(
      data.workOrder,
      ctx.request.body.action,
      !!data.disposalSiteId,
    );

    if (missingFields) {
      throw ApiError.invalidRequest(
        'WorkOrder should contain all required fields to be approved',
        `WorkOrder should contain required fields ${missingFields.join(', ')}`,
      );
    }
  }

  const orderRepo = OrderRepo.getInstance(ctx.state);

  const originalOrder = await orderRepo.getById({
    id,
    fields: [
      'onAccountTotal',
      'overrideCreditLimit',
      'grandTotal',
      'customerId',
      'status',
      'paymentMethod',
      'businessLineId',
      'businessUnitId',
      'commercialTaxesUsed',
    ].map(prefixKeyWithRefactored), // TODO: remove after refactoring
  });

  if (!originalOrder) {
    throw orderNotFound(id, ORDER_STATUS.completed);
  }

  // TODO: return to original order after refactoring
  // TODO: remove after refactoring
  const refactoredOriginalOrder = replaceLegacyWithRefactoredFieldsDeep(originalOrder);

  data.onAccountTotal = refactoredOriginalOrder.onAccountTotal;
  data.businessLineId = refactoredOriginalOrder.businessLineId; // taxes calc in editOne
  data.businessUnitId = refactoredOriginalOrder.businessUnitId;
  data.commercialTaxesUsed = refactoredOriginalOrder.commercialTaxesUsed;

  await checkCreditLimit(ctx, {
    order: refactoredOriginalOrder,
    updateData: data,
  });

  data.status = ORDER_STATUS.approved;

  if (overrideCreditLimit) {
    data.overrideCreditLimit = overrideCreditLimit;
  }

  const updatedOrder = await orderRepo.updateOne({
    condition: { id, status: ORDER_STATUS.completed },
    concurrentData,
    // TODO: return to original data after refactoring
    // TODO: remove prefixFields after refactoring
    data: prefixFieldsWithRefactoredDeep(data),
    // data,
    fields: [
      'grandTotal',
      'beforeTaxesTotal',
      'onAccountTotal',
      'overrideCreditLimit',
      'surchargesTotal',
    ].map(prefixKeyWithRefactored),
    log: true,
  });

  // TODO: return to original order after refactoring
  // TODO: remove after refactoring
  const refactoredUpdatedOrder = replaceLegacyWithRefactoredFieldsDeep(updatedOrder);

  const grandTotal = Number(refactoredUpdatedOrder.grandTotal);
  if (Number(refactoredOriginalOrder.grandTotal) !== grandTotal || overrideCreditLimit) {
    await billingProcessor.syncOrderTotals(ctx, {
      schemaName,
      orderId: id,
      grandTotal,
      onAccountTotal: Number(refactoredUpdatedOrder.onAccountTotal),
      beforeTaxesTotal: Number(refactoredUpdatedOrder.beforeTaxesTotal),
      surchargesTotal: Number(refactoredUpdatedOrder.surchargesTotal),
      overrideCreditLimit: Boolean(refactoredUpdatedOrder.overrideCreditLimit),
    });
  }

  ctx.status = httpStatus.OK;
};

export const unapproveOrder = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const { comment } = ctx.request.body;

  const repo = OrderRepo.getInstance(ctx.state);
  const order = await repo.updateBy({
    condition: { id, status: ORDER_STATUS.approved },
    concurrentData,
    data: {
      status: ORDER_STATUS.completed,
      unapprovedComment: comment,
    },
  });

  if (!order) {
    throw orderNotFound(id, ORDER_STATUS.approved);
  }

  repo.log({ id, action: repo.logAction.modify });

  ctx.sendObj(order);
};

export const finalizeOrder = async ctx => {
  const {
    user: { schemaName },
    concurrentData,
  } = ctx.state;
  const { id } = ctx.params;
  const { overrideCreditLimit, isRollOff, noBillableService } = ctx.request.body;

  const data = getCompletionData(ctx.request.body);

  // skip validation in case of noBillableService order
  if (!noBillableService && isRollOff) {
    // validation stage: required fields
    const fields = getMissingWorkOrderFields(
      data.workOrder,
      ctx.request.body.action,
      !!data.disposalSiteId,
    );

    if (fields) {
      throw ApiError.invalidRequest(
        'WorkOrder should contain all required fields to be finalized',
        `WorkOrder should contain required fields ${fields.join(', ')}`,
      );
    }
  }

  const orderRepo = OrderRepo.getInstance(ctx.state);
  const originalOrder = await orderRepo.getById({
    id,
    fields: [
      'onAccountTotal',
      'overrideCreditLimit',
      'grandTotal',
      'customerId',
      'status',
      'paymentMethod',
      'businessLineId',
      'businessUnitId',
      'commercialTaxesUsed',
    ].map(prefixKeyWithRefactored),
  });

  if (!originalOrder) {
    throw orderNotFound(id, ORDER_STATUS.approved);
  }

  // TODO: return to original order after refactoring
  // TODO: remove after refactoring
  const refactoredOriginalOrder = replaceLegacyWithRefactoredFieldsDeep(originalOrder);

  await checkCreditLimit(ctx, {
    order: refactoredOriginalOrder,
    updateData: data,
  });

  data.status = ORDER_STATUS.finalized;
  data.onAccountTotal = refactoredOriginalOrder.onAccountTotal;
  data.businessLineId = refactoredOriginalOrder.businessLineId; // taxes calc in editOne
  data.businessUnitId = refactoredOriginalOrder.businessUnitId;
  data.commercialTaxesUsed = refactoredOriginalOrder.commercialTaxesUsed;

  if (overrideCreditLimit) {
    data.overrideCreditLimit = overrideCreditLimit;
  }

  const updatedOrder = await orderRepo.updateOne({
    condition: { id, status: ORDER_STATUS.approved },
    concurrentData,
    // TODO: return to original data after refactoring
    // TODO: remove prefixFields after refactoring
    data: prefixFieldsWithRefactoredDeep(data),
    // data,
    fields: [
      'grandTotal',
      'beforeTaxesTotal',
      'onAccountTotal',
      'overrideCreditLimit',
      'surchargesTotal',
    ].map(prefixKeyWithRefactored),
    log: true,
  });

  // TODO: return to original order after refactoring
  // TODO: remove after refactoring
  const refactoredUpdatedOrder = replaceLegacyWithRefactoredFieldsDeep(updatedOrder);

  const grandTotal = Number(refactoredUpdatedOrder.grandTotal);
  if (Number(refactoredOriginalOrder.grandTotal) !== grandTotal || overrideCreditLimit) {
    await billingProcessor.syncOrderTotals(ctx, {
      schemaName,
      orderId: id,
      grandTotal,
      onAccountTotal: Number(refactoredUpdatedOrder.onAccountTotal),
      beforeTaxesTotal: Number(refactoredUpdatedOrder.beforeTaxesTotal),
      surchargesTotal: Number(refactoredUpdatedOrder.surchargesTotal),
      overrideCreditLimit: Boolean(refactoredUpdatedOrder.overrideCreditLimit),
    });
  }

  ctx.status = httpStatus.OK;
};

export const unfinalizeOrder = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const { comment } = ctx.request.body;

  const repo = OrderRepo.getInstance(ctx.state);
  const order = await repo.updateBy({
    condition: { id, status: ORDER_STATUS.finalized },
    concurrentData,
    data: {
      status: ORDER_STATUS.approved,
      unfinalizedComment: comment,
    },
  });

  if (!order) {
    throw orderNotFound(id, ORDER_STATUS.finalized);
  }

  repo.log({ id, action: repo.logAction.modify });

  ctx.sendObj(order);
};

export const changeOrderStatus = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const { status, isIndependentWorkOrder = false } = ctx.request.body;
  let repo = isIndependentWorkOrder ? IndependentWorkOrder : OrderRepo;

  repo = repo.getInstance(ctx.state);

  const order = await repo.updateBy({
    condition: { id },
    concurrentData,
    data: { status },
  });

  repo.log({ id, action: repo.logAction.modify });

  ctx.sendObj(order);
};
