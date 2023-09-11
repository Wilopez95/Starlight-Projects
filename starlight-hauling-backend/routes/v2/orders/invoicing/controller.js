import httpStatus from 'http-status';

import OrderRepo from '../../../../repos/v2/order.js';
import SubscriptionRepo from '../../../../repos/subscription/subscription.js';
import BusinessUnitRepo from '../../../../repos/businessUnit.js';

import * as billingProcessor from '../../../../services/billingProcessor.js';

import ApiError from '../../../../errors/ApiError.js';

const customerFieldsForInvoices = [
  'id',
  'businessName',
  'firstName',
  'lastName',
  'onAccount',
  'addFinanceCharges',
  'aprType',
  'financeCharge',
  'billingCycle',
  'paymentTerms',
  'invoiceConstruction',
  'balance',
  'creditLimit',
  'mailingAddressLine1',
  'mailingAddressLine2',
  'mailingCity',
  'mailingState',
  'mailingZip',
  'billingAddressLine1',
  'billingAddressLine2',
  'billingCity',
  'billingState',
  'billingZip',
  'sendInvoicesByEmail',
  'attachTicketPref',
  'attachMediaPref',
  'invoiceEmails',
  'ownerId',
  'isAutopayExist',
  'autopayType',
];

export const getInvoicingOrdersCount = async ctx => {
  const condition = ctx.request.validated.body;
  const { businessUnitId } = ctx.getRequestCondition();

  if (condition.customerId) {
    delete condition.billingCycles;
  }

  const total = await OrderRepo.getInstance(ctx.state).invoicingCount({
    businessUnitId,
    ...condition,
  });

  ctx.sendObj(total);
};

export const getInvoicingSubscriptionsOrdersCount = async ctx => {
  const condition = ctx.request.validated.body;
  const { businessUnitId } = ctx.getRequestCondition();

  if (condition.businessLineIds) {
    const { businessLineIds: filterByBusinessLine } = condition;
    delete condition.businessLineIds;

    condition.filterByBusinessLine = filterByBusinessLine;
  }

  const { billingDate: endingDate } = condition;
  delete condition.billingDate;

  condition.endingDate = endingDate;

  // why it's here?
  const subscriptionCountPromise = SubscriptionRepo.getInstance(ctx.state).invoicingCount({
    businessUnitId,
    ...condition,
  });

  const orderCountPromise = OrderRepo.getInstance(ctx.state).invoicingCount({
    businessUnitId,
    isWithSubs: true,
    ...condition,
  });

  const [ordersInfo, subscriptionsCountInfo] = await Promise.all([
    orderCountPromise,
    subscriptionCountPromise,
  ]);

  const result = {
    ordersCount: ordersInfo.total,
    subscriptionsCount: subscriptionsCountInfo.total,
  };

  ctx.sendObj(result);
};

export const runInvoicing = async ctx => {
  const condition = ctx.request.validated.body;
  const { businessUnitId } = ctx.getRequestCondition();

  const groupedResult = await billingProcessor.generateDrafts(
    { businessUnitId, ...condition },
    ctx,
  );

  ctx.sendObj(groupedResult);
};

export const runOrdersSubscriptionInvoicing = async ctx => {
  const condition = ctx.request.validated.body;
  const { businessUnitId } = ctx.getRequestCondition();

  if (condition.businessLineIds) {
    const { businessLineIds: filterByBusinessLine } = condition;
    delete condition.businessLineIds;

    condition.filterByBusinessLine = filterByBusinessLine;
  }

  const { billingDate: endingDate } = condition;
  delete condition.billingDate;

  condition.endingDate = endingDate;

  const groupedResult = await billingProcessor.generateSubscriptionDrafts(
    { businessUnitId, ...condition },
    ctx,
  );

  ctx.status = httpStatus.OK;
  ctx.body = groupedResult;
};

export const generateInvoices = async ctx => {
  const { invoices, businessUnitId: id } = ctx.request.validated.body;

  const { id: businessUnitId, type: businessUnitType } = await BusinessUnitRepo.getInstance(
    ctx.state,
  ).getById({
    id,
    fields: ['id', 'type'],
  });

  let result;
  try {
    result = await billingProcessor.generateInvoices(
      {
        invoices,
        customerFields: customerFieldsForInvoices,
        businessUnitId,
        businessUnitType,
      },
      ctx,
      { log: true },
    );
  } catch (error) {
    ctx.logger.error(error, 'Error while generating invoices');

    throw ApiError.invalidRequest('Error while generating invoices', error.details);
  }

  ctx.status = httpStatus.ACCEPTED;
  ctx.body = result;
};

export const generateSubscriptionsOrdersInvoices = async ctx => {
  const { invoices, billingDate } = ctx.request.validated.body;

  const result = await billingProcessor.generateInvoicesSubscriptionsOrders(
    ctx,
    {
      invoices,
      customerFields: customerFieldsForInvoices,
      billingDate,
    },
    { log: true },
  );

  ctx.status = httpStatus.ACCEPTED;
  ctx.body = result;
};
