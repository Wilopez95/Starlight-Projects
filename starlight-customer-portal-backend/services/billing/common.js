import httpStatus from 'http-status';

import { BILLING_URL } from '../../config.js';
import { makeGraphRequest, makeApiRequest } from '../../utils/request/makeRequest.js';

export const makeBillingGraphRequest = async ({ successStatus = httpStatus.OK, ctx, data }) => {
  const serviceMessage = 'Error while processing request to Billing';
  const result = await makeGraphRequest({
    baseUrl: BILLING_URL,
    serviceMessage,
    successStatus,
    ctx,
    data,
  });
  return result.data;
};

export const makeBillingApiRequest = async ({
  ctx,
  url,
  method,
  successStatus,
  data,
  responseType,
}) => {
  const serviceMessage = `Error while processing request to Billing API URL:"${url}", METHOD:"${method}"`;
  const result = await makeApiRequest({
    ctx,
    url,
    baseUrl: BILLING_URL,
    method,
    serviceMessage,
    successStatus,
    data,
    responseType,
  });
  return result;
};
