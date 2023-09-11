import httpStatus from 'http-status';

import syncTenantCustomersToBilling from '../../../../services/customer/syncTenantCustomersToBilling.js';

export const syncCustomers = async ctx => {
  const { schemaName } = ctx.request.validated.params;
  await syncTenantCustomersToBilling(ctx, schemaName);
  ctx.status = httpStatus.ACCEPTED;
};
