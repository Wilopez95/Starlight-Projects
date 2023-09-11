import { UnauthorizedError, AccessError } from '../services/error/index.js';
import logger from '../services/logger/index.js';

export const checkPermissions = (user, permissions) => {
  if (permissions.length === 0) {
    return true;
  }

  return permissions.some(permission => user.permissions.includes(permission));
};

export const authorizedMiddleware = (permissions = []) => {
  if (!Array.isArray(permissions)) {
    throw new TypeError('Expected permissions to be an array');
  }

  return async (req, res, next) => {
    const { user, serviceToken } = req;

    if (!user && !serviceToken) {
      logger.error('No user or service token');

      return next(new UnauthorizedError());
    }

    if (serviceToken) {
      return next();
    }

    if (!checkPermissions(user, permissions)) {
      return next(new AccessError());
    }

    return next();
  };
};
