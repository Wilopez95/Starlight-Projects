import { Next } from 'koa';
import { Context } from '../context';
import { User } from '../entities/User';
import { parseToken } from '../services/serviceToken';

export const serviceTokenMiddleware = async (ctx: Context, next: Next): Promise<void> => {
  const authorizationHeader = ctx.request.headers.authorization;

  if (!authorizationHeader) {
    await next();

    return;
  }

  const [tokenHeader, token] = authorizationHeader.split(' ');

  if (tokenHeader.toLowerCase() !== 'servicetoken') {
    await next();

    return;
  }

  try {
    const data = await parseToken(token, {
      audience: 'ums',
    });

    ctx.serviceToken = data;
    ctx.reqId = data.jti;
  } catch (e) {
    ctx.logger.error(e as Error);
  }

  if (ctx.serviceToken?.sub) {
    const user = await User.findOne(ctx.serviceToken.sub, {
      relations: ['policies', 'roles', 'roles.policies'],
    });

    if (user) {
      ctx.userInfo = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        tenantId: user.tenantId,
        tenantName: user.tenantName,
        resource: ctx.serviceToken.resource as string | undefined,
        access:
          typeof ctx.serviceToken.resource === 'string'
            ? user.getPermissionsForResource(ctx.serviceToken.resource)
            : {},
      };
    }
  }

  await next();
};
