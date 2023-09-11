import nock from 'nock';

import { BASE_URL } from './config.js';

const defaultInput = { id: 1, customerId: 1, isAutopayExist: false };
const defaultStatus = 200;

export const billingUpdateCustomerCcAutoPay = (
  { input: { customerId, cardId, data } = defaultInput, status = defaultStatus } = {},
  baseUrl = BASE_URL,
) =>
  nock(baseUrl)
    .patch(`/customers/${customerId}/credit-cards/auto-pay/${cardId}`, data)
    .reply(status);

export default billingUpdateCustomerCcAutoPay;
