import nock from 'nock';
import random from 'lodash/random.js';
import httpStatus from 'http-status';

import { BASE_URL } from './config.js';

const getDefaultOutput = () => ({
  id: random(100000, 200000),
});
const defaultStatus = httpStatus.CREATED;

const uriPattern = /^\/api\/trashapi\/v1\/workorders\/\d+$/;

export const dispatcherUpdateWorkOrder = (
  { status = defaultStatus, outputCallback } = {},
  baseUrl = BASE_URL,
) =>
  nock(baseUrl)
    .put(uriPattern, _requestBody => true)
    .query(() => true)
    .reply(status, outputCallback || getDefaultOutput);

export default dispatcherUpdateWorkOrder;
