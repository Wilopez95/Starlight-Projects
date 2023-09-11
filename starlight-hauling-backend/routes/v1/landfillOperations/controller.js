import pick from 'lodash/fp/pick.js';
import LandfillOperationRepo from '../../../repos/landfillOperation.js';

import { getRecyclingOrderById } from '../../../services/recycling.js';
import { upsertLandfillOperation } from '../../../services/amqp/subscriptions.js';

import { parseSearchQuery } from '../../../utils/search.js';
import { mathRound2 } from '../../../utils/math.js';

import ApiError from '../../../errors/ApiError.js';

import { ORDER_STATUS } from '../../../consts/orderStatuses.js';
import { SORT_ORDER } from '../../../consts/sortOrders.js';
import { LANDFILL_OPERATIONS_SORTING_ATTRIBUTE } from '../../../consts/loSortingAttributes.js';
import { pricingGetPriceOrder } from '../../../services/pricing.js';

const LANDFILL_OPERATIONS_PER_PAGE = 25;

const getFiltersData = pick([
  'filterByDateFrom',
  'filterByDateTo',
  'filterByNetWeightFrom',
  'filterByNetWeightTo',
  'filterByTimeInFrom',
  'filterByTimeInTo',
  'filterByTimeOutFrom',
  'filterByTimeOutTo',
]);

export const getLandfillOperationsCount = async ctx => {
  const { query } = ctx.request.validated.query;
  const { businessUnitId } = ctx.getRequestCondition();

  const filters = Object.assign(getFiltersData(ctx.request.validated.query), { businessUnitId });
  const total = await LandfillOperationRepo.getInstance(ctx.state).landfillOperationsCount({
    condition: {
      filters,
      ...parseSearchQuery(query),
    },
  });

  ctx.sendObj(total);
};

export const getLandfillOperations = async ctx => {
  const {
    query,
    skip = 0,
    limit = LANDFILL_OPERATIONS_PER_PAGE,
    sortBy = LANDFILL_OPERATIONS_SORTING_ATTRIBUTE.id,
    sortOrder = SORT_ORDER.desc,
  } = ctx.request.validated.query;
  const { businessUnitId } = ctx.getRequestCondition();

  const filters = Object.assign(getFiltersData(ctx.request.validated.query), { businessUnitId });
  const operations = await LandfillOperationRepo.getInstance(ctx.state).getAllPopulated({
    condition: { filters, ...parseSearchQuery(query) },
    skip: Number(skip),
    sortBy,
    sortOrder,
    limit: Math.min(Number(limit), LANDFILL_OPERATIONS_PER_PAGE),
  });

  ctx.sendArray(operations);
};

// emulate Landfill Operation create action from Recycling that goes through MQ
export const syncWithRecycling = async ctx => {
  const { schemaName } = ctx.state.user;
  const { recyclingTenantName, haulingOrderId, recyclingOrderId } = ctx.request.validated.body;

  const landfillOperation = await upsertLandfillOperation(ctx, {
    recyclingOrderId,
    haulingOrderId,
    recyclingTenantName,
    haulingTenantName: schemaName,
  });

  ctx.sendObj(landfillOperation);
};

export const getRecyclingOrder = async ctx => {
  const { id } = ctx.params;
  const { schemaName } = ctx.state.user;
  const { recyclingTenantName, businessUnitId } = ctx.request.query;

  ctx.state.tenantName = recyclingTenantName ?? schemaName;
  ctx.state.businessUnitId = businessUnitId;

  const recyclingOrder = await getRecyclingOrderById(ctx, +id);

  ctx.sendObj(recyclingOrder);
};

export const editLandfillOperation = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const {
    orderId,
    mappedMaterialId,

    truck,
    origin,
    purchaseOrder,

    arrivalDate,
    timeIn,
    arrivalUseTare,
    weightIn,

    departureDate,
    timeOut,
    weightOut,
    departureUseTare,
    truckTare,
    canTare,

    materials,
    miscellaneousItems,

    ticketNumber,
  } = ctx.request.validated.body;

  const data = {
    mappedMaterialId,

    truck,
    origin,
    purchaseOrder,

    arrivalDate,
    timeIn,
    arrivalUseTare,
    weightIn,

    departureDate,
    timeOut,
    weightOut,
    departureUseTare,
    truckTare,
    canTare,

    netWeight: mathRound2(Math.abs(Number(weightIn) - (Number(weightOut) || 0))),
    materials: materials || null,
    miscellaneousItems: miscellaneousItems || null,

    ticketNumber,
  };
  // pre-pricing service code:
  // const order = await OrderRepo.getInstance(ctx.state).getBy({
  //   condition: { id: orderId, fields: ['id', 'status'] },
  // });
  // if ([ORDER_STATUS.finalized, ORDER_STATUS.invoiced].includes(order.status)) {
  //   throw ApiError.conflict(
  //     undefined,
  //     `Landfill Operation cannot be edited for Order with status ${order.status}`,
  const order = await pricingGetPriceOrder(ctx, { data: { id: orderId } });
  if (!order[0]) {
    throw ApiError.unknown('Error while getting orders');
  }
  if ([ORDER_STATUS.finalized, ORDER_STATUS.invoiced].includes(order[0].status)) {
    throw ApiError.conflict(
      undefined,
      `Landfill Operation cannot be edited for Order with status ${order[0].status}`,
    );
  }

  const updateLoId = await LandfillOperationRepo.getInstance(ctx.state).updateOne({
    condition: { id },
    concurrentData,
    data,
    log: true,
  });

  const updatedLo = await LandfillOperationRepo.getInstance(ctx.state).getBy({
    condition: { id: updateLoId.id },
  });

  ctx.sendObj(updatedLo);
};

export const getLandfillOperationById = async ctx => {
  const { id } = ctx.params;

  const lo = await LandfillOperationRepo.getInstance(ctx.state).getBy({
    condition: { id },
  });

  ctx.sendObj(lo);
};
