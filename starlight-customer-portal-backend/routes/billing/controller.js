import httpStatus from 'http-status';

import { makeBillingGraphRequest } from '../../services/billing/common.js';

export const redirectBillingRequest = async (ctx) => {
  const data = await makeBillingGraphRequest({ ctx });
  ctx.body = data;
  ctx.status = httpStatus.OK;
};
