import httpStatus from 'http-status';

import { UMS_URL } from '../../config.js';
import { makeGraphRequest, makeApiRequest } from '../../utils/request/makeRequest.js';

export const makeUmsGraphRequest = async ({
  successStatus = httpStatus.OK,
  ctx,
  data,
  token,
  headers,
}) => {
  const serviceMessage = 'Error while processing request to UMS';
  const result = await makeGraphRequest({
    baseUrl: UMS_URL,
    serviceMessage,
    successStatus,
    ctx,
    data,
    token,
    headers,
  });
  return result.data;
};

export const makeUmsApiRequest = async ({
  ctx,
  url,
  method,
  successStatus,
  data,
  token,
  headers,
}) => {
  const serviceMessage = `Error while processing request to UMS API URL:"${url}", METHOD:"${method}"`;
  const result = await makeApiRequest({
    ctx,
    url,
    baseUrl: UMS_URL,
    method,
    serviceMessage,
    successStatus,
    data,
    token,
    headers,
  });
  return result.data;
};
