import { Middleware, Next } from 'koa';
import { Context, AppState } from '../types/Context';
import { getUserTokenData } from '../modules/auth/tokens';

export const userMiddleware = <C extends Context>({
  requireUserToken,
}: {
  requireUserToken?: boolean;
} = {}): Middleware<AppState, C> => {
  return async (ctx: C, next: Next): Promise<void> => {
    const authorizationHeader = ctx.request.headers['authorization'];

    if (!authorizationHeader || ctx.userInfo) {
      return await next();
    }

    const [tokenType, tokenId] = authorizationHeader.split(' ');

    if (tokenType !== 'Bearer' && !requireUserToken) {
      return await next();
    }

    if (!tokenId) {
      ctx.throw(401, 'Invalid token');
    }

    try {
      const tokenData = await getUserTokenData(tokenId, ctx);

      if (!tokenData) {
        throw new Error('No token data');
      }

      ctx.userInfo = tokenData.userInfo;
      ctx.tokenData = tokenData;
    } catch (e) {
      ctx.logger.error(e, 'Failed to parse token data');
      ctx.throw(401, 'Invalid token');
    }

    await next();
  };
};
