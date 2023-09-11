import omitBy from 'lodash/fp/omitBy.js';
import { GET } from '../../consts/methods.js';
import { TENANT_NAME } from '../../config.js';

import { RESPONSE_TYPES_VALUES } from '../../consts/responseTypes.js';
import getHeaders from './getHeaders.js';
import getService from './getService.js';

const omitUndefined = omitBy((val) => val === undefined);
const paramsSerializer = (params) => new URLSearchParams(omitUndefined(params)).toString();

const getApiRequestData = ({ ctx, method, data = {}, token, headers }) => {
  const {
    request: { body, query },
  } = ctx;
  const isGet = method === GET;

  const requestParams = isGet ? { ...query, ...data, tenantName: TENANT_NAME } : query;
  const requestData = !isGet ? { ...body, ...data, tenantName: TENANT_NAME } : body;
  const requestHeaders = getHeaders({ ctx, data: { token, headers } });

  return {
    data: requestData,
    headers: requestHeaders,
    params: requestParams,
  };
};

const requestApiService = async (args) => {
  const { baseUrl, url, method, responseType } = args;

  const request = getApiRequestData(args);
  const options = {
    url,
    method,
    ...request,
    paramsSerializer,
  };
  if (responseType && RESPONSE_TYPES_VALUES.includes(responseType)) {
    options.responseType = responseType;
  }

  const serviceApi = getService(baseUrl);
  const response = await serviceApi(options);
  return response;
};

export default requestApiService;
