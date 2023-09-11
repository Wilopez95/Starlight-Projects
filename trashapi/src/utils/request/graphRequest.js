import { GRAPHQL } from '../../consts/routes.js';
import { POST } from '../../consts/methods.js';

import getHeaders from './getHeaders.js';
import getService from './getService.js';

const getGraphRequestData = async ({ req, data = {}, token, serviceToken, headers, audience }) => {
  const { query: dataQuery, variables: dataVariables = {} } = data;

  const reqBody = req.body ?? {};
  const { query: reqQuery, variables: reqVariables } = reqBody;

  const requestHeaders = await getHeaders({
    req,
    data: { token, serviceToken, headers, audience },
  });
  const requestData = {
    query: dataQuery || reqQuery,
    variables: {
      ...reqVariables,
      ...dataVariables,
    },
  };

  return {
    headers: requestHeaders,
    data: requestData,
  };
};

const requestGraphService = async args => {
  const { baseUrl } = args;

  const request = await getGraphRequestData(args);
  const serviceGraph = getService(baseUrl);
  const response = await serviceGraph({
    url: GRAPHQL,
    method: POST,
    ...request,
  });
  return response;
};

export default requestGraphService;
