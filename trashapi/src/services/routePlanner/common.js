import httpStatus from 'http-status';

import { ROUTE_PLANNER_URL } from '../../config.js';
import { makeGraphRequest } from '../../utils/request/makeRequest.js';

export const makeRoutePlannerGraphRequest = async ({
  successStatus = httpStatus.OK,
  req,
  data,
  token,
  serviceToken,
  headers,
}) => {
  const serviceMessage = 'Error while processing request to RoutePlanner';
  const result = await makeGraphRequest({
    baseUrl: ROUTE_PLANNER_URL,
    serviceMessage,
    successStatus,
    req,
    data,
    token,
    serviceToken,
    headers,
  });

  return result.data;
};
