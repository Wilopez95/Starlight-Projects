import { Next } from 'koa';
import { Context, IUser } from '../Interfaces/Auth';
import ApiError from '../utils/ApiError';

export const checkPermissions = (user: IUser, permissions: string[]) => {
  if (permissions.length === 0) {
    return true;
  }

  return permissions.some(permission => user.permissions?.includes(permission));
};

export const authorized = (permissions: string[] = []) => {
  if (!Array.isArray(permissions)) {
    throw new TypeError('Expected permissions to be an array');
  }

  const authorizedMiddleware = async (ctx: Context, next: Next) => {
    const { user, serviceToken } = ctx.state;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!user && !serviceToken) {
      throw ApiError.notAuthenticated();
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (serviceToken !== undefined) {
      await next();
      return;
    }

    if (!checkPermissions(user, permissions)) {
      throw ApiError.accessDenied('check Permissions failed');
    }

    await next();
  };

  return authorizedMiddleware;
};
