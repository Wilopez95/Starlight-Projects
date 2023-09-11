import ApplicationError from '../errors/ApplicationError.js';

export const checkPermission = (user, permissions) => {
  if (permissions.length === 0) {
    return true;
  }

  return permissions.some(requiredPermission =>
    user.permissions.some(availablePermission => requiredPermission === availablePermission),
  );
};

export const authorized = (permissions = []) => {
  if (!Array.isArray(permissions)) {
    throw new TypeError('Expected permissions to be an array');
  }

  const authorizedMiddleware = async (ctx, next) => {
    const { user, serviceToken } = ctx.state;

    if (!user && !serviceToken) {
      ctx.logger.error('No user or service token');

      throw ApplicationError.notAuthenticated();
    }

    if (serviceToken) {
      await next();
      return;
    }
    if (!checkPermission(user, permissions)) {
      throw ApplicationError.accessDenied();
    }

    await next();
  };

  return authorizedMiddleware;
};
