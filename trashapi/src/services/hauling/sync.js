import axios from 'axios';
import HttpStatus from 'http-status';
import R from 'ramda';

import {
  HAULING_URL,
  HAULING_HEADERS_SEND_KEY,
  HAULING_HEADERS_SEND_VALUE,
  HAULING_HEADERS_GET_KEY,
  HAULING_HEADERS_GET_VALUE,
} from '../../config.js';
import { APIError } from '../error/index.js';
import logger from '../logger/index.js';
import { validateQueryParam } from '../../utils/functions.js';
import { createToken } from '../../auth/serviceToken.js';
import logServiceRequest from '../../utils/request/logServiceRequest.js';
import { disposalSitesListView } from '../../views/disposal-sites.js';

const allowedGetRoutes = ['disposal-sites', 'billable-services', 'materials'];
const IS_TEST = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'ci';

const haulingApi = axios.create({
  baseURL: HAULING_URL,
  validateStatus: status => status < HttpStatus.INTERNAL_SERVER_ERROR,
});

const mappers = {
  'billable-services': R.identity,
  materials: R.identity,
  'disposal-sites': disposalSitesListView,
};

const queryParamsList = [
  {
    key: 'materialId',
    type: 'integer',
  },
  {
    key: 'billableServiceId',
    type: 'integer',
  },
  {
    key: 'activeOnly',
    type: 'boolean',
  },
  {
    key: 'businessLineId',
    type: 'integer',
  },
  {
    key: 'description',
    type: 'string',
  },
];

/**
 * It takes a request object, tenantId, and query object, and returns an object with headers and params
 * @returns An object with headers and params
 */
const getRequestData = async ({ req, tenantId, query = {} }) => {
  const { reqId, user } = req;
  const userData = R.omit(['permissions'], user);
  const serviceToken = await createToken(userData, {
    requestId: reqId,
    audience: 'core',
    subject: user?.userId ? String(user.userId) : 'unknown',
  });

  const haulingHeader = {
    key: HAULING_HEADERS_SEND_VALUE,
    meta: parseInt(tenantId, 10) > 0 ? { tenantId } : {},
  };
  const headers = {
    authorization: `ServiceToken ${serviceToken}`,
    [HAULING_HEADERS_SEND_KEY]: JSON.stringify(haulingHeader),
  };

  const params = queryParamsList.reduce((acc, config) => {
    const { key } = config;
    const value = query[key];
    if (validateQueryParam(value, config)) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return {
    headers,
    params,
  };
};

const getBaseWorkOrdersHaulingPath = workOrderId => `/api/v1/orders/work-orders/${workOrderId}`;
const getWorkOrderErrorMessage = (message, workOrderId) => `
  Request to sync work order with Hauling(Core) API returned an error.
  Work order id "${workOrderId}".
  Reason: ${message}.
`;
const getRequestErrorMessage = (type, message, workOrderId) => `
  Request to get "${type}" from Hauling(Core) API returned an error.
  Work order id "${workOrderId}".
  Reason: ${message}.
`;

const formatError = error => ({
  message: error.message,
  status: error.status,
});

/**
 * This function returns an APIError object with the given message, status, and log flag.
 * @param message - The error message to be displayed to the user.
 * @param [log=true] - If true, the error will be logged to the console.
 * @param [status] - The HTTP status code to return.
 * @returns A function that takes in a message, log, and status.
 */
const getHaulingError = (message, log = true, status = HttpStatus.INTERNAL_SERVER_ERROR) => {
  const haulingError = new APIError(message, status, false, !IS_TEST);
  if (log) {
    logger.error(haulingError);
  }
  return haulingError;
};

/**
 * It sends a request to Hauling to sync the work order with Hauling
 * @returns the data from the response.
 */
export const syncOrderWithHauling = async ({ req, workOrder, workOrderSeed = {} }) => {
  const { headers } = req;
  if (headers[HAULING_HEADERS_GET_KEY] === HAULING_HEADERS_GET_VALUE) {
    return;
  }
  const order = { ...workOrder, ...workOrderSeed };
  const { id, tenantId } = order;
  const { haulingSync } = workOrder;
  // if tenantId is null, then order was not created from Hauling, no sync needed.
  if (!tenantId || !haulingSync) {
    return;
  }
  const basePath = getBaseWorkOrdersHaulingPath(id);

  let response;
  try {
    const url = `${basePath}/sync`;
    const request = await getRequestData({ req, tenantId });
    response = await haulingApi({
      url,
      method: 'post',
      ...request,
    });
  } catch (error) {
    const message = getWorkOrderErrorMessage(error, id);
    const haulingError = getHaulingError(message, true);
    return formatError(haulingError);
  }

  logServiceRequest(req, response);
  const status = response && response.status;
  const statusText = response && response.statusText;
  const data = response && response.data;

  if (status === HttpStatus.ACCEPTED) {
    return data;
  }

  let message;
  try {
    message = JSON.stringify(data);
  } catch (error) {
    logger.error(error);
    message = statusText;
  }

  const errorMessage = getWorkOrderErrorMessage(message, id);
  const haulingError = getHaulingError(errorMessage, true, status);
  return formatError(haulingError);
};

/**
 * It makes a request to the Hauling API and returns the response
 */
export const getHaulingData = async ({ req, type, workOrder, query }) => {
  if (!allowedGetRoutes.includes(type)) {
    throw new Error(`Route "${type}" for getting data from Hauling is not exists.`);
  }
  const { id, tenantId } = workOrder;
  const basePath = getBaseWorkOrdersHaulingPath(id);

  let response;
  try {
    const url = `${basePath}/${type}`;
    const request = await getRequestData({ req, tenantId, query });
    response = await haulingApi({
      url,
      method: 'get',
      ...request,
    });
  } catch (error) {
    const errorMessage = getRequestErrorMessage(type, error, id);
    throw getHaulingError(errorMessage, false);
  }

  logServiceRequest(req, response);
  const status = response && response.status;
  const statusText = response && response.statusText;
  const data = response && response.data;

  if (status === HttpStatus.OK) {
    return mappers[type](data);
  }

  let message;
  try {
    message = JSON.stringify(data);
  } catch (error) {
    logger.error(error);
    message = statusText;
  }

  const errorMessage = getRequestErrorMessage(type, message, id);
  throw getHaulingError(errorMessage, false, status);
};

/**
 * It returns a list of billable services for a work order
 * @returns An object with the following properties:
 *   - req: The request object
 *   - type: The type of data being requested
 *   - workOrder: The work order object
 *   - query: The query object
 */
export const getBillableServices = async ({ req, workOrder, query }) => {
  const type = 'billable-services';
  return getHaulingData({ req, type, workOrder, query });
};

/**
 * It returns the materials data from the `getHaulingData` function
 */
export const getMaterials = async ({ req, workOrder, query }) => {
  const type = 'materials';
  return getHaulingData({ req, type, workOrder, query });
};

/**
 * It returns a list of disposal sites for a given work order
 * @returns An object with the following properties:
 *   - req: The request object
 *   - type: The type of data being requested
 *   - workOrder: The work order object
 *   - query: The query object
 */
export const getDisposalSites = async ({ req, workOrder, query }) => {
  const type = 'disposal-sites';
  return getHaulingData({ req, type, workOrder, query });
};

const syncHaulingFieldsList = [
  'material',
  'size',
  'action',
  'haulingBillableServiceId',
  'haulingMaterialId',
  'haulingDisposalSiteId',
  'tenantId',
  'status',
];

// sync dispatch order with hauling(core) if any field in the list above was changed
/**
 * It syncs the edited work order with Hauling if the work order has the `haulingSync` flag set to
 * `true`
 * syncHaulingFieldsList = [
 *   'material',
 *   'size',
 *   'action',
 *   'haulingBillableServiceId',
 *   'haulingMaterialId',
 *   'haulingDisposalSiteId',
 *   'tenantId',
 *   'status',
 * ];
 * @returns The haulingResponse is being returned.
 */
export const syncEditedOrderWithHauling = async ({ req, workOrder, workOrderSeed }) => {
  const { haulingSync } = workOrder;
  if (!haulingSync) {
    return;
  }

  const isChanged = syncHaulingFieldsList.some(key => {
    const oldValue = workOrder[key];
    const newValue = workOrderSeed[key];
    return newValue && newValue !== oldValue;
  });
  if (!isChanged) {
    return;
  }

  const haulingResponse = await syncOrderWithHauling({
    req,
    workOrder,
    workOrderSeed,
  });
  // eslint-disable-next-line consistent-return
  return haulingResponse;
};
