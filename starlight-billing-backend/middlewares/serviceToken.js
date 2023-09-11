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

      const payload = ctx.state.serviceToken;
      if (payload) {
        ctx.state.user = {
          ...payload,
          subscriberName: payload.schemaName || payload.tenantName,
        };
      }
    }
  }

  await next();
};
