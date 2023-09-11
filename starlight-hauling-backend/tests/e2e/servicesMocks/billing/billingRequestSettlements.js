import nock from 'nock';

import { BASE_URL } from './config.js';

const URI = '/schedulers/request-settlement';

const defaultStatus = 204;

export const billingRequestSettlements = ({ status = defaultStatus } = {}, baseUrl = BASE_URL) =>
  nock(baseUrl).post(URI).reply(status);

export default billingRequestSettlements;
