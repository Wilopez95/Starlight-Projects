import { HAULING_URL } from '../../config.js';

import { makeApiRequest } from '../../utils/request/makeRequest.js';

export const makeHaulingApiRequest = async ({ ctx, url, method, successStatus }) => {
  const serviceMessage = `Error while processing request to Hauling API URL:"${url}", METHOD:"${method}"`;
  const result = await makeApiRequest({
    ctx,
    url,
    baseUrl: HAULING_URL,
    method,
    serviceMessage,
    successStatus,
  });
  return result.data;
};
