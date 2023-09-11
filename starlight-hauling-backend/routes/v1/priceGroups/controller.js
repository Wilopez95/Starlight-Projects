import httpStatus from 'http-status';
import { isAfter, isEqual } from 'date-fns';

import ApiError from '../../../errors/ApiError.js';

import PricesRepo from '../../../repos/prices.js';
import PriceGroupRepo from '../../../repos/priceGroups.js';

import upsertPrices from '../../../services/prices/upsertPrices.js';
// eslint-disable-next-line import/namespace
import duplicateCustomPriceGroup from '../../../services/prices/priceGroups/duplicatePriceGroup.js';
import batchRates from '../../../services/prices/batchRatesUpdate/batchRates.js';
import getPricesHistory from '../../../services/prices/getPricesHistory.js';

const validatePriceGroup = async ctx => {
  const { id } = ctx.params;
  const { body } = ctx.request.validated;

  let { startAt } = body;

  const { endAt } = body;

  if (id && endAt && !startAt) {
    const priceGroup = await PriceGroupRepo.getInstance(ctx.state).getById({ id });
    ({ startAt } = priceGroup);
  }

  if (startAt && endAt && !(isEqual(startAt, endAt) || isAfter(endAt, startAt))) {
    throw ApiError.invalidRequest(
      'Invalid startAt or endAt. endAt should be greater or equal to startAt',
    );
  }
};

export const getGeneralPrices = async ctx => {
  const { businessUnitId, businessLineId, entityType } = ctx.request.validated.query;

  const prices = await PricesRepo.getInstance(ctx.state).getAllGeneral({
    condition: { entityType, date: new Date() },
    priceGroupCondition: {
      businessUnitId,
      businessLineId,
    },
  });

  ctx.sendArray(prices);
};

export const setGeneralPrices = async ctx => {
  const data = ctx.request.validated.body;

  await upsertPrices(ctx.state, data);

  ctx.status = httpStatus.OK;
};

export const getPricesByPriceGroup = async ctx => {
  const { id: priceGroupId } = ctx.params;
  const { entityType } = ctx.request.validated.query;

  const prices = await PricesRepo.getInstance(ctx.state).getAllByDate({
    condition: { priceGroupId, date: new Date(), entityType },
  });

  ctx.sendArray(prices);
};

export const setCustomPrices = async ctx => {
  const data = ctx.request.validated.body;

  data.priceGroupId = Number(ctx.params.id);
  await upsertPrices(ctx.state, data);

  ctx.status = httpStatus.OK;
};

export const createPriceGroup = async ctx => {
  const { body: data } = ctx.request.validated;

  await validatePriceGroup(ctx);

  data.startAt = data.startAt ?? undefined;

  const priceGroup = await PriceGroupRepo.getInstance(ctx.state).createOne({ data });

  ctx.status = httpStatus.CREATED;
  ctx.body = priceGroup;
};

export const getPriceGroup = async ctx => {
  const { id } = ctx.params;

  const priceGroup = await PriceGroupRepo.getInstance(ctx.state).getByIdPopulated({ id });

  ctx.sendObj(priceGroup);
};

export const getCustomPriceGroups = async ctx => {
  const {
    activeOnly,
    skip,
    limit,
    type,
    customerGroupId,
    customerId,
    customerJobSiteId,
    serviceAreasIds,
    businessUnitId,
    businessLineId,
  } = ctx.request.validated.query;

  const priceGroups = await PriceGroupRepo.getInstance(ctx.state).getCustomFilteredAndPaginated({
    condition: {
      businessUnitId,
      businessLineId,
      isGeneral: false,

      ...(activeOnly && { active: true }),
      ...(customerGroupId && { customerGroupId }),
      ...(customerId && { customerId }),
      ...(customerJobSiteId && { customerJobSiteId }),
    },
    serviceAreasIds,
    type,
    skip,
    limit,
  });

  ctx.sendArray(priceGroups);
};

export const getLinkedPriceGroups = async ctx => {
  const { businessUnitId, businessLineId } = ctx.request.validated.query;

  const priceGroups = await PriceGroupRepo.getInstance(ctx.state).getLinkedPriceGroups({
    condition: {
      businessUnitId,
      businessLineId,
    },
  });

  ctx.sendArray(priceGroups);
};

export const updatePriceGroup = async ctx => {
  const { id } = ctx.params;
  const { body: data } = ctx.request.validated;

  await validatePriceGroup(ctx);

  data.user = ctx.state?.user?.email;
  data.startAt = data.startAt ?? undefined;

  const priceGroup = await PriceGroupRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    data,
  });

  ctx.sendObj(priceGroup);
};

export const deletePriceGroup = async ctx => {
  const { id } = ctx.params;

  await PriceGroupRepo.getInstance(ctx.state).deleteBy({ condition: { id } });

  ctx.status = httpStatus.NO_CONTENT;
};

export const duplicatePriceGroup = async ctx => {
  const { id } = ctx.params;
  const { body: data } = ctx.request.validated;

  await validatePriceGroup(ctx);

  const newPriceGroup = await duplicateCustomPriceGroup(ctx.state, id, data);

  ctx.sendObj(newPriceGroup);
};

export const batchRatesUpdate = async ctx => {
  const { body: data } = ctx.request.validated;

  data.today = new Date();
  await batchRates(ctx.state, data);

  ctx.status = httpStatus.OK;
};

export const batchRatesPreview = async ctx => {
  const { body: data } = ctx.request.validated;

  data.today = new Date();
  const previewPrices = await batchRates(ctx.state, data, { isPreview: true });

  ctx.sendArray(previewPrices);
};

export const getCustomPricesHistory = async ctx => {
  const { id } = ctx.params;
  const data = ctx.request.validated.query;

  const result = await getPricesHistory(ctx.state, { priceGroupId: id, ...data });

  ctx.sendArray(result);
};

export const getGeneralPricesHistory = async ctx => {
  const data = ctx.request.validated.query;

  const result = await getPricesHistory(ctx.state, data);

  ctx.sendArray(result);
};
