import nock from 'nock';

import { BASE_URL } from './config.js';

const URI = '/payments/check-prepaid-orders';

const defaultInput = [
  {
    id: 1,
    grandTotal: 215,
    customerId: 1,
    customerOriginalId: 1,
  },
  {
    id: 2,
    grandTotal: 215,
    customerId: 2,
    customerOriginalId: 2,
  },
];
const defaultOutput = [
  {
    customerOriginalId: 1,
    refundedAmount: 40,
    onAccountTotal: 400,
    overpaidAmount: 70,
    grandTotal: 215,
    availableCredit: 0,
    payments: [
      {
        amount: 215,
      },
    ],
    __overpaidOrder: true,
  },
  {
    customerOriginalId: 2,
    overrideCreditLimit: true,
    capturedTotal: 40,
    refundedAmount: 40,
    onAccountTotal: 400,
    overlimitAmount: 225,
    grandTotal: 215,
    availableCredit: 0,
    payments: [
      {
        amount: 215,
      },
    ],
    __overlimitOrder: true,
  },
];
const defaultStatus = 200;

export const billingCheckAndProcessPrepaidOrders = (
  { input = defaultInput, output = defaultOutput, status = defaultStatus } = {},
  baseUrl = BASE_URL,
) => nock(baseUrl).post(URI, input).reply(status, output);

export default billingCheckAndProcessPrepaidOrders;
