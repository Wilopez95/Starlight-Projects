import nock from 'nock';

import { BASE_URL } from './config.js';

const defaultStatus = 200;
const getDefaultOutput = (uri, input) =>
  input.orders.map(order => ({
    customerOriginalId: input.customerId,
    refundedAmount: 0,
    onAccountTotal: 1000,
    overpaidAmount: 0,
    grandTotal: order.grandTotal,
    availableCredit: 1000,
    payments: input.payments.map(payment => ({ amount: payment.amount })),
    __overpaidOrder: false,
  }));

const uriPattern = /^\/api\/billing\/v1\/payments\/place-order$/;

export const billingPlaceOrders = (
  { status = defaultStatus, outputCallback } = {},
  baseUrl = BASE_URL,
) =>
  nock(baseUrl)
    .post(uriPattern, () => true)
    .query(() => true)
    .reply(status, outputCallback || getDefaultOutput);

export default billingPlaceOrders;
