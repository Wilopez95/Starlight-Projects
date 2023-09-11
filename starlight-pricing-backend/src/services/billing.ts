import { Context } from '../Interfaces/Auth';
import { makeBillingRequest } from '../utils/makeRequest';

export const getAvailableCredit = (ctx: Context, { customerId }) =>
  makeBillingRequest(ctx, {
    method: 'get',
    url: `/customers/${customerId}/available-credit`,
  });
