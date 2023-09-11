import ApplicationError from '../errors/ApplicationError.js';

export const checkPermissions = (user, permissions) => {
  if (permissions.length === 0) {
    return true;
  }

  return permissions.some((permission) => user.permissions.includes(permission));
};

export const authorizedMiddleware = (permissions = []) => {
  if (!Array.isArray(permissions)) {
    throw new TypeError('Expected permissions to be an array');
  }

  return async (ctx, next) => {
    const { user, serviceToken } = ctx.state;

    if (!user && !serviceToken) {
      ctx.logger.error('No user or service token');

      throw ApplicationError.notAuthenticated();
    }

    if (serviceToken) {
      await next();
      return;
    }

    if (!checkPermissions(user, permissions)) {
      throw ApplicationError.accessDenied();
    }

    await next();
  };
};
