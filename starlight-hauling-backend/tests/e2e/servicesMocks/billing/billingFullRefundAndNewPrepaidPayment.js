import nock from 'nock';

import { PAYMENT_TYPE } from '../../../../consts/paymentType.js';

import { BASE_URL } from './config.js';

const URI = '/payments/refund-wrong-cc';

const defaultInput = {
  refundedPaymentId: 1,

  orderId: 1,
  customerId: 1,

  paymentType: PAYMENT_TYPE.creditCard,

  date: '2022-10-03',

  checkNumber: null,
  isAch: false,

  creditCardId: 1,
  newCreditCard: null,
};
const defaultStatus = 204;

export const billingFullRefundAndNewPrepaidPayment = (
  { input = defaultInput, status = defaultStatus } = {},
  baseUrl = BASE_URL,
) => nock(baseUrl).post(URI, input).reply(status);

export default billingFullRefundAndNewPrepaidPayment;
