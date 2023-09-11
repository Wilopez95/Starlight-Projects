import httpStatus from 'http-status';

import BillableSurchargeRepo from '../../../repos/billableSurcharge.js';
import OrderSurchargeRepo from '../../../repos/orderSurcharge.js';

import { ORDER_STATUS } from '../../../consts/orderStatuses.js';

export const getBillableSurchargeById = async ctx => {
  const { id } = ctx.params;

  const surchargeItem = await BillableSurchargeRepo.getInstance(ctx.state).getById({
    id,
  });

  ctx.sendObj(surchargeItem);
};

export const getBillableSurcharges = async ctx => {
  const contextCondition = ctx.getRequestCondition();
  const { query } = ctx.request.validated;
  const { activeOnly, ...condition } = query;

  Object.assign(condition, contextCondition);
  activeOnly && (condition.active = true);

  const surcharges = await BillableSurchargeRepo.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.sendArray(surcharges);
};

export const createBillableSurcharge = async ctx => {
  const data = ctx.request.validated.body;

  const newSurcharge = await BillableSurchargeRepo.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newSurcharge;
};

export const editBillableSurcharge = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const data = ctx.request.validated.body;

  const updatedSurcharge = await BillableSurchargeRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data,
    log: true,
  });

  ctx.sendObj(updatedSurcharge);
};

export const deleteBillableSurcharge = async ctx => {
  const { id } = ctx.params;

  await BillableSurchargeRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};

export const getSurchargesQBData = async ctx => {
  const { joinHistoricalTableIds } = ctx.request.validated.query;

  let surcharges;
  if (joinHistoricalTableIds) {
    surcharges = await BillableSurchargeRepo.getInstance(ctx.state).getAllWithHistorical({
      condition: {},
      fields: ['description'],
    });
  } else {
    surcharges = await BillableSurchargeRepo.getInstance(ctx.state).getAll({
      condition: {},
      fields: ['description'],
    });
  }

  ctx.sendArray(surcharges);
};

export const getSurchargesSumQBData = async ctx => {
  const { rangeFrom, rangeTo, integrationBuList } = ctx.request.validated.query;

  const surchargesSum = await OrderSurchargeRepo.getInstance(ctx.state).getQBSum({
    condition: {
      rangeFrom,
      rangeTo,
      integrationBuList,
      // since we integrate with qb data only from invoiced orders
      orderStatus: ORDER_STATUS.invoiced,
    },
  });

  ctx.sendArray(surchargesSum);
};
