/* eslint-disable prefer-const */
import httpStatus from 'http-status';

import OrderRepo from '../../../../repos/order.js';
import WorkOrderRepo from '../../../../repos/workOrder.js';
import DisposalSiteRepo from '../../../../repos/disposalSite.js';
import BillableServiceRepo from '../../../../repos/billableService.js';
import MaterialRepo from '../../../../repos/material.js';
import BusinessLineRepo from '../../../../repos/businessLine.js';

import * as billingProcessor from '../../../../services/billingProcessor.js';

import ApiError from '../../../../errors/ApiError.js';

import { ORDER_STATUS } from '../../../../consts/orderStatuses.js';
import { pricingGetPriceOrder } from '../../../../services/pricing.js';

const woNotFound = woNumber =>
  ApiError.notFound('WorkOrder not found', `WorkOrder doesn't exist with number ${woNumber}`);

const orderNotFound = orderId =>
  ApiError.notFound('Order not found', `Order doesn't exist with id ${orderId}`);

export const autoSyncWithDispatch = async ctx => {
  const { woNumber } = ctx.params;

  ctx.logger.info(`Sync from Dispatch for WO ${woNumber} started`);

  const { workOrder, schemaName } = await WorkOrderRepo.getWoByNumber({
    woNumber,
    schemaName: ctx.state.schemaName,
    fields: ['id'],
  });
  ctx.logger.info(`Sync from Dispatch for WO ${workOrder.id} started`);
  if (!workOrder) {
    throw woNotFound(woNumber);
  }

  const orderRepo = OrderRepo.getInstance(ctx.state, { schemaName });
  const [order] = await pricingGetPriceOrder(ctx, { data: { workOrderId: workOrder.id } }); // orderRepo.getBy({ condition: { woNumber } });

  const { id: orderId, grandTotal: originalGrandTotal } = order;
  if (!order) {
    throw orderNotFound(orderId);
  }
  if (!order.workOrder || !(order?.workOrder?.id >= 1)) {
    throw ApiError.notFound(
      'An attempt to sync Order with Dispatch failed since no WO order exists',
      `Order with id ${orderId} have no WO cannot be synced with Dispatch`,
    );
  }
  if (order.status !== ORDER_STATUS.inProgress) {
    throw ApiError.invalidRequest(
      `Specified order ${orderId} does not have InProgress status`,
      'Only inProgress Orders can be synced automatically',
    );
  }

  // update synced WO data and calculate thresholds
  // search here
  const { woOrder, thresholdsTotal, thresholdsItems, newLineItemsTotal, orderData } =
    await WorkOrderRepo.getInstance(ctx.state, {
      schemaName,
    }).syncDataAndCalculateThresholdsAndManifests(order);
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
      orderId,
      grandTotal: Number(updatedOrder.grandTotal),
      onAccountTotal: Number(updatedOrder.onAccountTotal),
      surchargesTotal: Number(updatedOrder.surchargesTotal),
      beforeTaxesTotal: Number(updatedOrder.beforeTaxesTotal),
    });
  }

  ctx.logger.info(`Sync from Dispatch for WO ${woNumber} completed`);
  ctx.status = httpStatus.ACCEPTED;
};

const getBlIdAndSchema = async ctx => {
  const woNumber = Number.parseInt(ctx.params.woNumber, 10);
  let { businessLineId } = ctx.request.validated.query;

  let workOrder;
  let schemaName;
  if (woNumber) {
    const result = await WorkOrderRepo.getWoByNumber({
      woNumber,
      schemaName: ctx.state.schemaName,
      fields: ['id'],
    });

    ({ workOrder, schemaName } = result ?? {});
    if (!workOrder || !schemaName) {
      throw woNotFound(woNumber);
    }

    let response = await pricingGetPriceOrder(ctx, { data: { workOrderId: workOrder.id } });
    // orderRepo.getBy({ condition: { woNumber } });
    if (!response) {
      throw orderNotFound();
    }
    const [order] = response;

    businessLineId = order.businessLine.id;
  } else if (businessLineId) {
    if (ctx.state.schemaName) {
      ({ schemaName } = ctx.state);
    } else {
      schemaName = await BusinessLineRepo.getSchemaByBlId(businessLineId);
    }

    if (!schemaName) {
      throw ApiError.notFound('Scheme cannot be identified based on input params');
    }
  } else {
    throw ApiError.invalidRequest(
      'Unspecified WO Number or Business Line Id in order to fetch data',
    );
  }

  return { businessLineId, schemaName };
};

export const getBillableServices = async ctx => {
  const { businessLineId, schemaName } = await getBlIdAndSchema(ctx);

  const { materialId, activeOnly } = ctx.request.validated.query ?? {};
  const condition = {
    businessLineId,
    oneTime: true,
    materialId,
  };
  activeOnly && (condition.active = true);

  const services = await BillableServiceRepo.getInstance(ctx.state, {
    schemaName,
  }).populateWithAllowedMaterials({
    condition,
  });

  ctx.sendArray(services);
};

export const getMaterials = async ctx => {
  const { businessLineId, schemaName } = await getBlIdAndSchema(ctx);

  const { billableServiceId, activeOnly } = ctx.request.validated.query ?? {};
  const condition = { businessLineId };
  activeOnly && (condition.active = true);

  const materialRepo = MaterialRepo.getInstance(ctx.state, { schemaName });
  let materials;
  if (billableServiceId) {
    condition.billableServiceId = billableServiceId;

    materials = await materialRepo.getAllByService({ condition });
  } else {
    materials = await materialRepo.getAll({ condition });
  }

  ctx.sendArray(materials);
};

export const getDisposalSites = async ctx => {
  const { woNumber } = ctx.params;

  // why not from ctx? can we process items from wrong tenant here?
  const { schemaName } = await WorkOrderRepo.getWoByNumber({
    woNumber,
    schemaName: ctx.state.schemaName,
    fields: ['id'],
  });
  if (!schemaName) {
    throw woNotFound(woNumber);
  }

  const { activeOnly, description } = ctx.request.validated.query ?? {};
  const condition = {};
  activeOnly && (condition.active = true);
  if (description) {
    condition.description = description;
  }

  const sites = await DisposalSiteRepo.getInstance(ctx.state, { schemaName }).getAll({
    condition,
  });

  ctx.sendArray(sites);
};
