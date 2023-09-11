import nock from 'nock';

import { PAYMENT_GATEWAY } from '../../../../consts/paymentGateway.js';

import { BASE_URL } from './config.js';

const URI = '/payments/validate-creds';

const defaultInput = {
  paymentGateway: PAYMENT_GATEWAY.cardConnect,
  mid: 'dsadas',
  username: 'dsadas',
  password: 'dsadas',
  salespointMid: 'dsadas',
  salespointUsername: 'dsadas',
  salespointPassword: 'dsadas',
};
const defaultStatus = 200;

export const billingValidateMerchantData = (
  { input = defaultInput, status = defaultStatus } = {},
  baseUrl = BASE_URL,
) => nock(baseUrl).post(URI, input).reply(status);

export default billingValidateMerchantData;
