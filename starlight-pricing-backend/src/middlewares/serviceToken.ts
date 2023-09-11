import { Next } from 'koa';
import { Context } from '../Interfaces/Auth';
import { parseServiceToken } from '../services/tokens';

export const serviceToken = async (ctx: Context, next: Next) => {
  const { authorization } = ctx.request.headers;

  if (authorization) {
    const [tokenHeader, token] = authorization.split(' ');

    if (tokenHeader.toLowerCase() === 'servicetoken') {
      try {
        ctx.state.serviceToken = await parseServiceToken(token);
      } catch (e: unknown) {
        ctx.logger.error(e);
      }

      const payload = ctx.state.serviceToken;
      if (payload?.schemaName || payload?.tenantName) {
        ctx.state.user = {
          ...payload,
          subscriberName: payload.schemaName ?? payload.tenantName,
          tenantName: payload.schemaName ?? payload.tenantName,
        };
      }
    }
  }

  await next();
};
