import nock from 'nock';

import { BASE_URL } from './config.js';

const URI = '/schedulers/charge-deferred';

const defaultStatus = 204;

export const billingChargeDeferredPayments = (
  { status = defaultStatus } = {},
  baseUrl = BASE_URL,
) => nock(baseUrl).post(URI).reply(status);

export default billingChargeDeferredPayments;
