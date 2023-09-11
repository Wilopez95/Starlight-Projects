import nock from 'nock';

import { PAYMENT_METHOD } from '../../../../consts/paymentMethods.js';

import { BASE_URL } from './config.js';

const defaultInput = 1;
const defaultOutput = {
  payments: [
    {
      paymentMethod: PAYMENT_METHOD.mixed,
      overrideCreditLimit: false,
      checkNumber: null,
      isAch: false,
      sendReceipt: false,
      deferredPayment: false,
      authorizeCard: false,
      deferredUntil: null,
      amount: 300,
      creditCardId: 1,
      newCreditCard: null,
    },
  ],
  invoiceId: 1,
};
const defaultStatus = 200;

export const billingGetOrderPaymentsHistory = (
  { input = defaultInput, output = defaultOutput, status = defaultStatus } = {},
  baseUrl = BASE_URL,
) => nock(baseUrl).get(`/payments/history/${input}`).reply(status, output);

export default billingGetOrderPaymentsHistory;
