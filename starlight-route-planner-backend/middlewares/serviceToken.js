import { parseServiceToken } from '../services/tokens.js';

export const serviceToken = async (ctx, next) => {
  const { authorization } = ctx.request.headers;

  if (authorization) {
    const [tokenHeader, token] = authorization.split(' ');

    if (tokenHeader?.toLowerCase() === 'servicetoken') {
      try {
        ctx.state.serviceToken = await parseServiceToken(token);
      } catch (e) {
        ctx.logger.error(e);
      }
    }

    if (ctx.state.serviceToken) {
      // TODO: clarify what is that and why
      const copy = { ...ctx.state.serviceToken };

      if (copy.sub) {
        copy.id = copy.sub;
        copy.userId = copy.sub;
      }

      ctx.state.user = copy;
      ctx.state.userTokenData = copy;
    }
  }

  await next();
};
