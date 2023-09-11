import ApiError from '../errors/ApiError.js';

export const checkPermissions = (user, permissions) => {
  if (permissions.length === 0) {
    return true;
  }

  return permissions.some(permission => user.permissions.includes(permission));
};

export const authorized = (permissions = []) => {
  if (!Array.isArray(permissions)) {
    throw new TypeError('Expected permissions to be an array');
  }

  const authorizedMiddleware = async (ctx, next) => {
    const { user, serviceToken } = ctx.state;

    if (!user && !serviceToken) {
      ctx.logger.error('No user or service token');

      throw ApiError.notAuthenticated();
    }

    if (serviceToken) {
      await next();
      return;
    }

    if (!checkPermissions(user, permissions)) {
      throw ApiError.accessDenied();
    }

    await next();
  };

  return authorizedMiddleware;
};
