import httpStatus from 'http-status';
import calculateOrderPricesService from '../../../services/pricesCalculation/order/calculatePrices.js';

export const calculateOrderPrices = async ctx => {
  const { body } = ctx.request.validated;
  const prices = await calculateOrderPricesService(ctx, body);
  ctx.sendObj(prices);
};

export const calculateSubscriptionPrices = ctx => {
  // const { body } = ctx.request.validated;
  // const prices = await calculateSubscriptionPrices(ctx, body);
  // ctx.sendObj(prices);
  ctx.status = httpStatus.OK;
};

export const calculateSubscriptionOrderPrices = ctx => {
  // const { body } = ctx.request.validated;
  // const prices = await calculateSubscriptionPrices(ctx, body);
  // ctx.sendObj(prices);
  ctx.status = httpStatus.OK;
};
