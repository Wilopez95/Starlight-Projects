import httpStatus from 'http-status';
import pick from 'lodash/fp/pick.js';
import omit from 'lodash/omit.js';

import BillableLineItemRepo from '../../../repos/billableLineItem.js';

import { LINE_ITEM_TYPE } from '../../../consts/lineItemTypes.js';

export const getBillableLineItemById = async ctx => {
  const { id } = ctx.params;

  const lineItem = await BillableLineItemRepo.getInstance(ctx.state).getById({
    id,
  });

  ctx.sendObj(lineItem);
};

export const getBillableLineItems = async ctx => {
  const contextCondition = ctx.getRequestCondition();
  const { query } = ctx.request.validated;
  const { activeOnly, oneTime, materialBasedPricing, ...condition } = query;

  Object.assign(condition, contextCondition);
  activeOnly && (condition.active = true);

  if ('materialBasedPricing' in query) {
    condition.materialBasedPricing = !!materialBasedPricing;
  }
  if ('oneTime' in query) {
    condition.oneTime = oneTime;
  }
  const lineItems = await BillableLineItemRepo.getInstance(ctx.state).getAllWithIncludes({
    condition,
    nestedFields: ['billingCycles'],
  });

  ctx.sendArray(lineItems);
};

export const createBillableLineItem = async ctx => {
  const { billingCycles, ...data } = ctx.request.validated.body;

  const repo = BillableLineItemRepo.getInstance(ctx.state);
  let newLineItem;
  if (data.oneTime) {
    newLineItem = await repo.createOneTime({ data, log: true });
  } else {
    newLineItem = await repo.createRecurrent({ data, billingCycles, log: true });
  }

  ctx.status = httpStatus.CREATED;
  ctx.body = Object.assign(newLineItem, { materialIds: data.materialIds ?? [] });
};

export const editBillableLineItem = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  // eslint-disable-next-line prefer-const
  let { billingCycles, ...data } = ctx.request.validated.body;

  data =
    data.type === LINE_ITEM_TYPE.tripCharge
      ? pick(['description', 'materialBasedPricing', 'applySurcharges', 'oneTime'], data)
      : data;

  const repo = BillableLineItemRepo.getInstance(ctx.state);
  let updatedLineItem;
  if (data.oneTime) {
    updatedLineItem = await repo.updateOneTime({
      condition: { id },
      concurrentData,
      data,
      log: true,
    });
  } else {
    updatedLineItem = await repo.updateRecurrent({
      condition: { id },
      concurrentData,
      data: omit(data, 'materialIds'),
      billingCycles,
      log: true,
    });
  }

  ctx.sendObj(Object.assign(updatedLineItem, { materialIds: data.materialIds ?? [] }));
};

export const deleteBillableLineItem = async ctx => {
  const { id } = ctx.params;

  await BillableLineItemRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    conditionNot: { type: LINE_ITEM_TYPE.tripCharge },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};

export const getBillableLineItemsQBData = async ctx => {
  const { joinHistoricalTableIds } = ctx.request.validated.query;

  let lineItems;
  if (joinHistoricalTableIds) {
    lineItems = await BillableLineItemRepo.getInstance(ctx.state).getAllWithHistorical({
      condition: {},
      fields: ['id', 'type'],
    });
  } else {
    lineItems = await BillableLineItemRepo.getInstance(ctx.state).getAll({
      condition: {},
      fields: ['type'],
    });
  }

  ctx.sendArray(lineItems);
};
