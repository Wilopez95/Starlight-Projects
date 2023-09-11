import { HAULING_URL } from '../../config.js';

import { makeApiRequest } from '../../utils/request/makeRequest.js';

export const makeHaulingApiRequest = async ({ req, url, method, successStatus, data = {} }) => {
  const serviceMessage = `Error while processing request to Hauling API URL:"${url}", METHOD:"${method}"`;
  const result = await makeApiRequest({
    req,
    url,
    baseUrl: HAULING_URL,
    method,
    serviceMessage,
    successStatus,
    data,
    audience: 'core',
  });
  return result.data;
};
