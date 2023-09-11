import httpStatus from 'http-status';
import pick from 'lodash/fp/pick.js';

import OrderRepo from '../../../../repos/order.js';
import WorkOrderRepo from '../../../../repos/workOrder.js';
import IndependentWorkOrder from '../../../../repos/independentWorkOrder.js';
import InventoryRepo from '../../../../repos/inventory/inventory.js';

import * as billingService from '../../../../services/billing.js';
import * as billingProcessor from '../../../../services/billingProcessor.js';
import { checkCreditLimit } from '../../../../services/independentOrders/checkCreditLimit.js';
import { publishers } from '../../../../services/routePlanner/publishers.js';

import { ORDER_STATUS, ORDER_STATUSES } from '../../../../consts/orderStatuses.js';
import { WO_STATUS } from '../../../../consts/workOrder.js';
import { INDEPENDENT_WO_STATUS } from '../../../../consts/independentWorkOrder.js';

import ApiError from '../../../../errors/ApiError.js';
import {
  pricingAlterOrder,
  pricingGetPriceOrder,
  pricingUnfinalizeOrder,
} from '../../../../services/pricing.js';

const getCompletionData = pick([
  'materialId',
  'billableServiceId',
  'billableServicePrice',
  'billableServiceApplySurcharges',
  'projectId',
  'promoId',
  'disposalSiteId',

  'workOrder',

  'invoiceNotes',
  'driverInstructions',

  'lineItems',
  'thresholds',
  'manifestItems',
  'newManifestItems',

  'grandTotal',
  'paymentMethod',
  'overrideCreditLimit',
  'applySurcharges',
  'surcharges',
  'customRatesGroupId',
]);

const getCancellationData = pick(['reasonType', 'comment', 'addTripCharge']);

const orderNotFound = (id, status) =>
  ApiError.notFound('Order not found', `Order doesn't exist with id ${id} and status ${status}`);

export const syncWithDispatch = async ctx => {
  const { schemaName } = ctx.state.user;
  const { id } = ctx.params;
  const orderRepo = OrderRepo.getInstance(ctx.state);
  const [order] = await pricingGetPriceOrder(ctx, { data: { id } });
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
  // pre-pricing service code:
  // const { woOrder, thresholdsTotal, newLineItemsTotal, orderData } =
  //   await WorkOrderRepo.getInstance(ctx.state).syncDataAndCalculateThresholdsAndManifests(
  //     order,
  //     true,
  //   );
  // end pre-pricing service code
  const { woOrder, thresholdsTotal, newLineItemsTotal, orderData } =
    await WorkOrderRepo.getInstance(ctx.state).syncDataAndCalculateThresholdsAndManifests(order);
  const updatedOrder = await orderRepo.postSyncWithDispatchUpdate({
    order,
    thresholdsTotal,
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

  const result = await pricingGetPriceOrder(ctx, { data: { id } });

  ctx.sendObj(result[0]);
};

export const cancelOrder = async ctx => {
  const {
    user: { schemaName, userId },
    concurrentData,
  } = ctx.state;
  const { id } = ctx.params;
  const data = getCancellationData(ctx.request.body);

  const order = await OrderRepo.getInstance(ctx.state).cancelOne({
    condition: { id, status: ORDER_STATUS.inProgress },
    concurrentData,
    data,
    fields: ['grandTotal', 'beforeTaxesTotal', 'onAccountTotal', 'surchargesTotal', 'isRollOff'],
    log: true,
  });

  if (!order) {
    throw orderNotFound(id, ORDER_STATUS.inProgress);
  }

  const { id: orderId } = order;

  if (order.wasDeferred) {
    const relatedOrders = await billingService.getDeferredPaymentOrders(ctx, { orderId });
    const nonCanceledOrders = await OrderRepo.getInstance(ctx.state).getByIdsAndStatuses({
      ids: relatedOrders.map(element => element.id),
      statuses: ORDER_STATUSES.filter(element => element !== ORDER_STATUS.canceled),
      fields: ['id', 'grandTotal'],
    });

    await billingService.unDeferredPaymentByOrderId(ctx, { orderId, data: { nonCanceledOrders } });
  }

  await billingProcessor.syncOrderTotals(ctx, {
    schemaName,
    orderId,
    grandTotal: Number(order.grandTotal),
    onAccountTotal: Number(order.onAccountTotal),
    surchargesTotal: Number(order.surchargesTotal),
    beforeTaxesTotal: Number(order.beforeTaxesTotal),
  });

  if (!order.isRollOff) {
    await publishers.syncIndependentToDispatch(
      { state: ctx.state, logger: ctx.state.logger },
      {
        schemaName,
        userId,
        independentWorkOrders: [
          {
            orderId,
            ...data,
            status: INDEPENDENT_WO_STATUS.canceled,
            businessLineId: order.businessLine.id,
            businessUnitId: order.businessUnit.id,
            independentWorkOrderId: order.workOrder.id,
            billableServiceId: order.billableService.id,
            customerJobSiteId: order.customerJobSite.originalId,
            lineItems: data.lineItems,
            preferredRoute: data.route || data.preferredRoute || null,
          },
        ],
      },
    );
  }

  ctx.status = httpStatus.NO_CONTENT;
};

export const completeOrder = async ctx => {
  const {
    user: { schemaName, userId },
    concurrentData,
  } = ctx.state;

  const { id } = ctx.params;
  const { overrideCreditLimit, isRollOff } = ctx.request.body;

  if (ctx.request.body.noBillableService) {
    throw ApiError.invalidRequest(
      'An attempt to complete non-billable Order failed since no WO order exists',
      `Order with id ${id} is non-billable so cannot be completed since no WO`,
    );
  }

  const data = getCompletionData(ctx.request.body);
  // validation stage: required fields
  if (isRollOff) {
    const missingFields = WorkOrderRepo.checkRequiredFields(
      data.workOrder,
      ctx.request.body.action,
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
  const [originalOrder] = await pricingGetPriceOrder(ctx, { data: { id } });
  if (!originalOrder) {
    throw orderNotFound(id, ORDER_STATUS.inProgress);
  }

  if (!originalOrder.workOrder.woNumber) {
    throw ApiError.invalidRequest('Order with unpaid Deferred Payment cannot be completed');
  }

  originalOrder.customerId = originalOrder.customer.id;
  await checkCreditLimit(ctx, {
    order: originalOrder,
    updateData: data,
  });

  data.status = ORDER_STATUS.completed;
  data.workOrder.status = WO_STATUS.completed;
  data.onAccountTotal = originalOrder.onAccountTotal;
  data.businessLineId = originalOrder.businessLine.id; // taxes calc in editOne
  data.businessUnitId = originalOrder.businessUnit.id;
  data.commercialTaxesUsed = originalOrder.commercialTaxesUsed;

  if (overrideCreditLimit) {
    data.overrideCreditLimit = overrideCreditLimit;
  }
  if (id && concurrentData?.[id]) {
    concurrentData[id] = concurrentData[id].substring(0, concurrentData[id].length - 1);
  }
  const order = await orderRepo.completeOne({
    condition: { id, status: ORDER_STATUS.inProgress },
    concurrentData,
    data,
    prevServiceId: originalOrder.billableService?.originalId,
    originalOrder,
    fields: [
      'id',
      'grandTotal',
      'beforeTaxesTotal',
      'onAccountTotal',
      'overrideCreditLimit',
      'surchargesTotal',
      'independentWorkOrderId',
      'customerJobSiteId',
      'serviceDate',
    ],
    log: true,
  });

  if (!order.isRollOff) {
    await publishers.syncIndependentToDispatch(
      { state: ctx.state, logger: ctx.state.logger },
      {
        schemaName,
        userId,
        independentWorkOrders: [
          {
            orderId: order.id,
            ...order.workOrder,
            ...data,
            serviceDate: order.serviceDate,
            independentWorkOrderId: order.workOrder.id,
            billableServiceId: order.billableService.id,
            customerJobSiteId: order.customerJobSite.originalId,
            lineItems: data.lineItems,
            preferredRoute: data.route || data.preferredRoute || null,
          },
        ],
      },
    );
  }

  const grandTotal = Number(order.grandTotal);
  if (Number(originalOrder.grandTotal) !== grandTotal || overrideCreditLimit) {
    await billingProcessor.syncOrderTotals(ctx, {
      schemaName,
      orderId: id,
      grandTotal,
      onAccountTotal: Number(order.onAccountTotal),
      beforeTaxesTotal: Number(order.beforeTaxesTotal),
      surchargesTotal: Number(order.surchargesTotal),
      overrideCreditLimit: Boolean(order.overrideCreditLimit),
    });
  }

  const inventoryRepo = InventoryRepo.getInstance(ctx.state);
  await inventoryRepo.updateInventoryByOrderInfo(originalOrder);

  ctx.status = httpStatus.OK;
};

export const approveOrder = async ctx => {
  const {
    user: { schemaName },
  } = ctx.state;
  const { id } = ctx.params;
  const { overrideCreditLimit, isRollOff, noBillableService } = ctx.request.body;

  const data = getCompletionData(ctx.request.body);

  // Skip validation for noBillableService order.
  if (!noBillableService && isRollOff) {
    const missingFields = WorkOrderRepo.checkRequiredFields(
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

  const [originalOrder] = await pricingGetPriceOrder(ctx, { data: { id } });
  if (!originalOrder || originalOrder.status !== ORDER_STATUS.completed) {
    throw orderNotFound(id, ORDER_STATUS.completed);
  }

  data.onAccountTotal = originalOrder.onAccountTotal;
  data.businessLineId = originalOrder.businessLineId; // taxes calc in editOne
  data.businessUnitId = originalOrder.businessUnitId;
  data.commercialTaxesUsed = originalOrder.commercialTaxesUsed;

  await checkCreditLimit(ctx, {
    order: originalOrder,
    updateData: data,
  });

  data.status = ORDER_STATUS.approved;

  if (overrideCreditLimit) {
    data.overrideCreditLimit = overrideCreditLimit;
  }
  // pre-pricing service code:

  // if (id && concurrentData?.[id]) {
  //   concurrentData[id] = concurrentData[id].substring(0, concurrentData[id].length - 1);
  // }
  // const order = await orderRepo.updateOne({
  //   condition: { id, status: ORDER_STATUS.completed },
  //   concurrentData,
  //   data,
  //   fields: [
  //     'grandTotal',
  //     'beforeTaxesTotal',
  //     'onAccountTotal',
  //     'overrideCreditLimit',
  //     'surchargesTotal',
  //   ],
  //   log: true,
  // });
  // end pre-pricing service code
  await pricingAlterOrder(ctx, { data: { status: ORDER_STATUS.approved } }, originalOrder.id);
  const [order] = await pricingGetPriceOrder(ctx, { data: { id } });

  const grandTotal = Number(order.grandTotal);
  if (Number(originalOrder.grandTotal) !== grandTotal || overrideCreditLimit) {
    await billingProcessor.syncOrderTotals(ctx, {
      schemaName,
      orderId: id,
      grandTotal,
      onAccountTotal: Number(order.onAccountTotal),
      beforeTaxesTotal: Number(order.beforeTaxesTotal),
      surchargesTotal: Number(order.surchargesTotal),
      overrideCreditLimit: Boolean(order.overrideCreditLimit),
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
    const fields = WorkOrderRepo.checkRequiredFields(
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
    ],
  });
  if (!originalOrder) {
    throw orderNotFound(id, ORDER_STATUS.approved);
  }

  await checkCreditLimit(ctx, {
    order: originalOrder,
    updateData: data,
  });

  data.status = ORDER_STATUS.finalized;
  data.onAccountTotal = originalOrder.onAccountTotal;
  data.businessLineId = originalOrder.businessLineId; // taxes calc in editOne
  data.businessUnitId = originalOrder.businessUnitId;
  data.commercialTaxesUsed = originalOrder.commercialTaxesUsed;

  if (overrideCreditLimit) {
    data.overrideCreditLimit = overrideCreditLimit;
  }

  if (id && concurrentData?.[id]) {
    concurrentData[id] = concurrentData[id].substring(0, concurrentData[id].length - 1);
  }

  const order = await orderRepo.updateOne({
    condition: { id, status: ORDER_STATUS.approved },
    concurrentData,
    data,
    fields: [
      'grandTotal',
      'beforeTaxesTotal',
      'onAccountTotal',
      'overrideCreditLimit',
      'surchargesTotal',
    ],
    log: true,
  });

  const grandTotal = Number(order.grandTotal);
  if (Number(originalOrder.grandTotal) !== grandTotal || overrideCreditLimit) {
    await billingProcessor.syncOrderTotals(ctx, {
      schemaName,
      orderId: id,
      grandTotal,
      onAccountTotal: Number(order.onAccountTotal),
      beforeTaxesTotal: Number(order.beforeTaxesTotal),
      surchargesTotal: Number(order.surchargesTotal),
      overrideCreditLimit: Boolean(order.overrideCreditLimit),
    });
  }

  ctx.status = httpStatus.OK;
};

// pre-pricing service code:
// export const unfinalizeOrder = async ctx => {
//   const { concurrentData } = ctx.state;
// end pre-pricing service code
export const unfinalizeOrder = async ctx => {
  const { id } = ctx.params;
  const { comment } = ctx.request.body;

  const repo = OrderRepo.getInstance(ctx.state);
  const order = await pricingUnfinalizeOrder(
    ctx,
    {
      data: {
        status: ORDER_STATUS.approved,
        unfinalizedComment: comment,
      },
    },
    id,
  );

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
