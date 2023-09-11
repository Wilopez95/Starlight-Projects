import omitBy from 'lodash/fp/omitBy.js';
import { GET } from '../../consts/methods.js';

import { RESPONSE_TYPES_VALUES } from '../../consts/responseTypes.js';
import getHeaders from './getHeaders.js';
import getService from './getService.js';

const omitUndefined = omitBy(val => val === undefined);
const paramsSerializer = params => new URLSearchParams(omitUndefined(params)).toString();

/**
 * It takes in a request object, a method, and some data, and returns an object with the request data,
 * headers, and params
 * @returns An object with the following properties:
 *   data: requestData,
 *   headers: requestHeaders,
 *   params: requestParams,
 */
const getApiRequestData = async ({
  req,
  method,
  data = {},
  token,
  serviceToken,
  headers,
  audience,
}) => {
  const { body, query } = req;
  const isGet = method === GET;

  const requestParams = isGet ? { ...query, ...data } : query;
  // eslint-disable-next-line no-negated-condition
  const requestData = !isGet ? { ...body, ...data } : body;
  const requestHeaders = await getHeaders({
    req,
    data: { token, serviceToken, headers, audience },
  });

  return {
    data: requestData,
    headers: requestHeaders,
    params: requestParams,
  };
};

/**
 * It takes an object of arguments, and returns a promise that resolves to the response from the API
 * @returns A function that takes in an object with the following properties:
 *   baseUrl: string
 *   url: string
 *   method: string
 *   responseType: string
 *   data: object
 *   params: object
 *   headers: object
 *   timeout: number
 *   withCredentials: boolean
 *   auth: object
 *   onUploadProgress: function
 *   onDownloadProgress:
 */
const requestApiService = async args => {
  const { baseUrl, url, method, responseType } = args;

  const request = await getApiRequestData(args);
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
