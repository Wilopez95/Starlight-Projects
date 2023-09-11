import { GRAPHQL } from '../../consts/routes.js';
import { POST } from '../../consts/methods.js';
import { TENANT_NAME } from '../../config.js';

import getHeaders from './getHeaders.js';
import getService from './getService.js';

const getGraphRequestData = ({ ctx, data = {}, token, headers }) => {
  const { query: dataQuery, variables: dataVariables = {} } = data;
  const {
    request: {
      body: { query: reqQuery, variables: reqVariables },
    },
  } = ctx;

  const requestHeaders = getHeaders({ ctx, data: { token, headers } });
  const requestData = {
    query: dataQuery || reqQuery,
    variables: {
      ...reqVariables,
      ...dataVariables,
      tenantName: TENANT_NAME,
    },
  };

  return {
    headers: requestHeaders,
    data: requestData,
  };
};

const requestGraphService = async (args) => {
  const { baseUrl } = args;

  const request = getGraphRequestData(args);
  const serviceGraph = getService(baseUrl);
  const response = await serviceGraph({
    url: GRAPHQL,
    method: POST,
    ...request,
  });
  return response;
};

export default requestGraphService;
