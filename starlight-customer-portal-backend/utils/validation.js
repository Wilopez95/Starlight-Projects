/* eslint-disable no-new */
import httpStatus from 'http-status';

import ApplicationError from '../errors/ApplicationError.js';
import * as codes from '../errors/codes.js';
import { capitalizeFirstLetter } from './textTransforms.js';

const invalidError = (message) =>
  new ApplicationError('Invalid request', codes.INVALID_REQUEST, message, httpStatus.BAD_REQUEST);

export const isNumber = (value) => !Number.isNaN(Number(value));

export const checkId = (entity, id) => {
  if (isNumber(id)) {
    return;
  }
  const message = `${capitalizeFirstLetter(entity)} ID must be provided, please adjust your input`;
  throw invalidError(message);
};

export const checkURI = (property, value) => {
  if (!value) {
    throw invalidError(`You must provide ${property}`);
  }

  try {
    new URL(value);
  } catch (error) {
    throw invalidError(`${property} must be a valid URL`);
  }
};

export const checkRequired = (property, value) => {
  if (!value) {
    throw invalidError(`You must provide ${property}`);
  }
};

const requiredPortalUserProps = ['customerId', 'tenantId', 'tenantName'];
export const checkPortalUserProperties = (user) => {
  const invalidProps = requiredPortalUserProps.filter((prop) => !user[prop]);
  if (invalidProps.length) {
    throw invalidError(
      `Missing required Customer Portal user properties: "${invalidProps.join(', ')}"`,
    );
  }
};
