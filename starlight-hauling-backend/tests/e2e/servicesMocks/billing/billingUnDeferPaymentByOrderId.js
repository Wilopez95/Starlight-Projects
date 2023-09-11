import nock from 'nock';

import { BASE_URL } from './config.js';

const defaultStatus = 204;

const uriPattern = /^\/api\/billing\/v1\/payments\/(\d+)\/undefer$/;
const getDefaultOutput = () => ({});

export const billingUnDeferPaymentByOrderId = (
  { status = defaultStatus, outputCallback } = {},
  baseUrl = BASE_URL,
) =>
  nock(baseUrl)
    .post(uriPattern)
    .query(() => true)
    .reply(status, outputCallback || getDefaultOutput);

export default billingUnDeferPaymentByOrderId;
