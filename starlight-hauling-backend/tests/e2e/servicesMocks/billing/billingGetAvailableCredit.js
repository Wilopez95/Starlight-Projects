import nock from 'nock';
import httpStatus from 'http-status';

import { BASE_URL } from './config.js';

const getDefaultOutput = () => ({ availableCredit: 1000 });
const defaultStatus = httpStatus.OK;
const uriPattern = /^\/api\/billing\/v1\/customers\/(\d+)\/available-credit$/;

export const billingGetAvailableCredit = (
  { status = defaultStatus, outputCallback } = {},
  baseUrl = BASE_URL,
) =>
  nock(baseUrl)
    .get(uriPattern)
    .query(() => true)
    .reply(status, outputCallback || getDefaultOutput);

export default billingGetAvailableCredit;
