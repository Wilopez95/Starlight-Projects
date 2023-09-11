import httpStatus from 'http-status';

import { getCreditCards, getCreditCard } from '../../../graphql/queries.js';
import {
  upsertCreditCard,
  updateCreditCard,
  creditCardAutoPay,
} from '../../../graphql/mutations.js';

export const getCustomer = async ctx => {
  const { customerId } = ctx.params;
  const { Customer } = ctx.state.models;

  const customer = await Customer.getById(customerId);

  ctx.body = customer ?? null;
  ctx.status = httpStatus.OK;
};

export const getAvailableCredit = async ctx => {
  const { Customer } = ctx.state.models;
  const { customerId } = ctx.params;

  const balances = await Customer.getBalances(customerId);

  const { availableCredit = 0 } = balances ?? {};
  ctx.body = { availableCredit };
  ctx.status = httpStatus.OK;
};

export const getCustomerCreditCards = async ctx => {
  const { customerId } = ctx.params;
  const { activeOnly, spUsedOnly, creditCardId, merchantId } = ctx.request.validated.query;

  ctx.state.logger = ctx.logger;
  let items = [];
  if (creditCardId) {
    items = [await getCreditCard(ctx.state, { id: creditCardId })];
  } else {
    items = await getCreditCards(ctx.state, {
      customerId,
      activeOnly,
      spUsedOnly,
      returnCcToken: true,
      merchantId,
    });
  }

  ctx.body = items;
  ctx.status = httpStatus.OK;
};

export const addCustomerCreditCard = async ctx => {
  const { customerId } = ctx.params;
  const newCreditCard = ctx.request.validated.body;

  const isContractor = newCreditCard?.isContractor;
  delete newCreditCard?.isContractor;

  ctx.state.logger = ctx.logger;

  const { Customer } = ctx.state.models;

  const customer = await Customer.getById(customerId);
  if (!customer) {
    ctx.status = httpStatus.NOT_FOUND;
    return;
  }

  const { userId = -1 } = ctx.state.user;
  const { creditCard } = await upsertCreditCard(ctx, { newCreditCard }, customer, {
    log: true,
    userId: isContractor ? 'system' : userId,
  });

  ctx.status = httpStatus.OK;
  ctx.body = await getCreditCard(ctx.state, { id: creditCard.id });
};

export const updateCustomerCreditCard = async ctx => {
  const { id } = ctx.params;
  const data = ctx.request.body;

  const isContractor = data?.isContractor;
  delete data?.isContractor;

  ctx.state.logger = ctx.logger;
  const cc = await updateCreditCard(
    ctx.state,
    { id, data },
    { log: true, userId: isContractor ? 'system' : ctx.user.userId },
  );

  ctx.status = httpStatus.OK;
  ctx.body = await getCreditCard(ctx.state, { id: cc.id });
};

export const updateCustomerCreditCardAutoPay = async ctx => {
  const { id } = ctx.params;
  const data = ctx.request.body;
  ctx.state.logger = ctx.logger;

  await creditCardAutoPay(ctx, { id, data });

  ctx.status = httpStatus.OK;
};
