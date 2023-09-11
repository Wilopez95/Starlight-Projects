import httpStatus from 'http-status';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';

import CompanyRepo from '../../../repos/company.js';

import * as billingService from '../../../services/billing.js';
import {
  notifyCustomersDayBefore,
  generateOrdersFromRecurrentOrderTemplates,
} from '../../../services/amqp/subscriptions.js';

const { zonedTimeToUtc } = dateFnsTz;
export const notifyCustomers = async ctx => {
  const { schemaName, tenantId } = ctx.state.user;

  const company = await CompanyRepo.getInstance(ctx.state).getBy({
    condition: { tenantId },
    fields: ['companyNameLine1 as companyName', 'phone', 'timeZoneName'],
  });

  await notifyCustomersDayBefore(ctx, { schemaName, tenantId, company }, { skipTimeCheck: true });

  ctx.status = httpStatus.NO_CONTENT;
};

export const chargeDeferredPayments = async ctx => {
  await billingService.chargeDeferredPayments(ctx);

  ctx.status = httpStatus.NO_CONTENT;
};

export const requestSettlements = async ctx => {
  await billingService.requestSettlements(ctx);

  ctx.status = httpStatus.NO_CONTENT;
};

export const generateOrdersFromRecurrentOrder = async ctx => {
  const { schemaName, tenantId } = ctx.state.user;
  const { date } = ctx.request.validated.body;

  const company = await CompanyRepo.getInstance(ctx.state).getBy({
    condition: { tenantId },
    fields: ['companyNameLine1 as companyName', 'timeZoneName'],
  });

  await generateOrdersFromRecurrentOrderTemplates(
    ctx,
    { schemaName, tenantId, company },
    { skipTimeCheck: true },
    zonedTimeToUtc(date, 'UTC'),
  );

  ctx.status = httpStatus.NO_CONTENT;
};
