import httpStatus from 'http-status';

import { APIError } from '../../services/error/index.js';
import requestApiService from './apiRequest.js';
import requestGraphService from './graphRequest.js';
import logServiceRequest from './logServiceRequest.js';

const getServiceError = (message, error, status = httpStatus.INTERNAL_SERVER_ERROR) => {
  const errorMessage = `
      ${message}
      ${error}
    `;
  const apiError = new APIError(errorMessage, status, true);
  return apiError;
};

const requestServices = {
  api: requestApiService,
  graphql: requestGraphService,
};

export const makeRequest = async args => {
  const { serviceMessage, successStatus, type, req } = args;

  let response;
  try {
    const requestService = requestServices[type];
    if (!requestService) {
      throw new Error(`Request service with type ${type} not exist`);
    }
    response = await requestService(args);
  } catch (error) {
    const serviceError = getServiceError(serviceMessage, error.message);
    throw serviceError;
  }

  logServiceRequest(req, response);
  const { status, statusText, data } = response || {};

  if (status === successStatus) {
    return response;
  }

  let errorMessage;
  try {
    errorMessage = JSON.stringify(data);
  } catch (error) {
    errorMessage = statusText;
  }

  const serviceError = getServiceError(serviceMessage, errorMessage, status);
  throw serviceError;
};

export const makeApiRequest = async args => {
  const fullArgs = { ...args, type: 'api' };
  const result = await makeRequest(fullArgs);
  return result;
};

export const makeGraphRequest = async args => {
  const fullArgs = { ...args, type: 'graphql' };
  const result = await makeRequest(fullArgs);
  return result;
};
