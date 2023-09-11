import { type Next } from 'koa';

import { type Context } from '../context';
import { getResourceTokenCookie } from '../services/cookies';
import { decryptToken, extractFromHeaders } from '../services/token';
import { User } from '../entities/User';

type Headers = Record<string, string | undefined>;

/**
 * It takes the token from the cookie, decrypts it, and then checks if the token is valid. If it is, it
 * will set the userInfo property on the context object to the decrypted token
 * @param {Context} ctx - The context object.
 * @param {Next} next - Next is a function that is called when the middleware is done.
 */
export const userInfoMiddleware = async (ctx: Context, next: Next): Promise<void> => {
  const token = getResourceTokenCookie(ctx) ?? extractFromHeaders(ctx.headers as Headers);

  if (token) {
    try {
      ctx.userInfo = await decryptToken(token);

      const user = await User.findOne(ctx.userInfo.id, {
        relations: ['policies', 'roles', 'roles.policies'],
      });

      if (user) {
        ctx.userInfo.email = user.email || '';
        ctx.userInfo.firstName = user.firstName || '';
        ctx.userInfo.lastName = user.lastName || '';
        ctx.userInfo.name = user.name || '';
        ctx.userInfo.tenantId = user.tenantId || '';
        ctx.userInfo.tenantName = user.tenantName || '';

        if (ctx.userInfo.resource) {
          ctx.userInfo.access = user.getPermissionsForResource(ctx.userInfo.resource);
        }
      }
    } catch (error) {
      ctx.logger.info(error as Error, `Invalid token: ${token}`);
    }
  }

  await next();
};
