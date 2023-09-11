import nock from 'nock';

import { PAYMENT_TYPE } from '../../../../consts/paymentType.js';

import { BASE_URL } from './config.js';

const defaultInput = {
  paymentId: 1,
  data: {
    orderId: 1,
    grandTotal: 250,

    deferredUntil: '2021-10-17',

    date: '2021-08-17',

    paymentType: PAYMENT_TYPE.creditCard,

    checkNumber: null,
    isAch: false,

    creditCardId: 1,
    newCreditCard: null,
  },
};
const defaultOutput = { orderIds: [1] };
const defaultStatus = 200;

export const billingUpdateDeferredPayment = (
  {
    input: { paymentId, data } = defaultInput,
    output = defaultOutput,
    status = defaultStatus,
  } = {},
  baseUrl = BASE_URL,
) => nock(baseUrl).put(`/payments/${paymentId}/deferred`, data).reply(status, output);

export default billingUpdateDeferredPayment;
