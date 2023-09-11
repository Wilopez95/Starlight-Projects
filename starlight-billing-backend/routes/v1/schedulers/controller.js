import httpStatus from 'http-status';

import {
  chargeTenantDeferredPayments,
  autoRequestTenantSettlement,
} from '../../../services/amqp/subscriptions.js';

export const chargeDeferredPayments = async ctx => {
  const { schemaName, tenantId, userId } = ctx.state.user;

  const company = await ctx.state.models.Company.getBy({
    condition: { tenantId },
  });

  await chargeTenantDeferredPayments(
    ctx,
    { name: schemaName, id: tenantId, company, userId },
    { skipTimeCheck: true },
  );

  ctx.status = httpStatus.NO_CONTENT;
};

export const requestSettlements = async ctx => {
  const { schemaName, tenantId } = ctx.state.user;

  const company = await ctx.state.models.Company.getBy({ condition: { tenantId } });

  await autoRequestTenantSettlement(ctx, { name: schemaName, company }, { skipTimeCheck: true });

  ctx.status = httpStatus.NO_CONTENT;
};
