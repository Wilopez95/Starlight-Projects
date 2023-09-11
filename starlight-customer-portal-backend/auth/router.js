import querystring from 'querystring';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import httpStatus from 'http-status';
import { noCacheMiddleware as noCache } from '../middlewares/noCache.js';
import { UMS_URL, TRACING_PARAM, API_HOST } from '../config.js';
import {
  initiateUmsLogin,
  initiateUmsLogout,
  refreshUmsToken,
  exchangeUmsCodeForToken,
  fetchUmsResourceInfo,
  meUmsRequest,
} from '../services/ums/auth.js';
import { client as redis } from '../services/redis.js';
import ApplicationError from '../errors/ApplicationError.js';
import { getTenantData } from '../services/hauling/companies.js';
import {
  createUserTokens,
  getUserTokenData,
  getUserRefreshTokenData,
  deleteTokensByAccessToken,
  deleteTokensByRefreshToken,
} from './tokens.js';
import { createToken } from './serviceToken.js';

if (!UMS_URL) {
  throw new Error('Missing UMS_SERVICE_API_URL');
}

export const buildAuthRouter = (options) => {
  const {
    getFrontendUrl,
    getResource,
    getResourceUrlPart,
    redirectToLogin: redirectToLoginParam,
  } = options;
  const authRouter = new Router();

  if (!getFrontendUrl) {
    throw new Error('Missing getFrontendUrl');
  }

  const getBaseResourceFeUrl = (ctx, resourceInfo) => {
    const loginUrl = resourceInfo?.loginUrl;

    if (!loginUrl) {
      return getFrontendUrl(ctx);
    }

    try {
      const url = new URL(loginUrl);

      return `${url.protocol}//${url.host}`;
    } catch {
      return getFrontendUrl(ctx);
    }
  };

  const getResourceInfo = async (ctx, resource, serviceToken) => {
    let token = serviceToken;

    if (!token) {
      token = await createToken(
        {},
        {
          audience: 'ums',
          subject: resource,
          requestId: ctx.reqId,
        },
      );
    }

    const response = await fetchUmsResourceInfo(ctx, { srn: resource, serviceToken: token });

    if (response.errors) {
      return null;
    }

    return response.data.resource;
  };

  const redirectToLogin =
    redirectToLoginParam ||
    ((ctx, data, baseUrl) =>
      ctx.redirect(`${baseUrl}${getResourceUrlPart(ctx)}/login?${querystring.stringify(data)}`));

  const loginController = async (ctx) => {
    if (!UMS_URL) {
      throw new Error('Missing UMS_URL');
    }

    const { reqId } = ctx;
    const resource = await getResource(ctx);
    const serviceToken = await createToken(
      {},
      {
        audience: 'ums',
        subject: resource,
        requestId: reqId,
      },
    );
    const resourceInfo = await getResourceInfo(ctx, resource, serviceToken);
    const resourceBaseFeUrl = getBaseResourceFeUrl(ctx, resourceInfo);

    try {
      const response = await initiateUmsLogin(ctx, {
        redirectUri: `${API_HOST}/v1/auth${getResourceUrlPart(ctx)}/logincb`,
        resource,
        serviceToken,
      });

      // TODO remember feBaseUrl for a redirect to finish-login
      await redis.set(
        `login:feBaseUrl:${reqId}`,
        resourceBaseFeUrl,
        'ex',
        60 * 15, // 15 minutes
      );

      ctx.redirect(response.redirectTo);
    } catch (e) {
      ctx.logger.error(e);

      redirectToLogin(
        ctx,
        {
          error: 'Failed to start login session',
          [TRACING_PARAM]: reqId,
        },
        resourceBaseFeUrl,
      );
    }
  };

  authRouter.get('/login', noCache, loginController);
  authRouter.post('/login', noCache, loginController);

  authRouter.post(
    '/refresh',
    noCache,
    bodyParser({
      onerror: (_, ctx) => {
        ctx.status = httpStatus.BAD_REQUEST;
        ctx.body = {
          message: 'Error parsing request body',
        };
      },
    }),
    async (ctx) => {
      const { refreshToken } = ctx.request.body;

      if (!refreshToken) {
        throw ApplicationError.notAuthenticated();
      }

      const refreshData = await getUserRefreshTokenData(ctx, refreshToken);

      if (!refreshData) {
        throw ApplicationError.notAuthenticated();
      }

      const { umsRefreshToken } = refreshData;

      try {
        const umsUserTokens = await refreshUmsToken(ctx, umsRefreshToken);
        const umsAccessToken = umsUserTokens.accessToken;

        const tokenDataInfo = await meUmsRequest(ctx, umsAccessToken);

        await deleteTokensByRefreshToken(ctx, refreshToken);

        const tenantData = await getTenantData(ctx);
        const { customerId } = ctx.params;
        const me = {
          ...tokenDataInfo.data.me,
          ...tenantData,
          customerId: customerId ? parseInt(customerId, 10) : null,
        };
        const userTokens = await createUserTokens(umsUserTokens, me);

        ctx.body = {
          ...userTokens,
        };
      } catch (e) {
        ctx.logger.error('Failed to refresh token', e);

        throw ApplicationError.notAuthenticated();
      }
    },
  );

  authRouter.get('/logout', noCache, async (ctx) => {
    const { token, systemLogout } = ctx.query;
    const resource = await getResource(ctx);
    const resourceInfo = await getResourceInfo(ctx, resource);
    const baseFeUrl = getBaseResourceFeUrl(ctx, resourceInfo);

    const tokenData = await getUserTokenData(ctx, token);

    if (!tokenData) {
      redirectToLogin(
        ctx,
        {
          error: 'Invalid token',
        },
        baseFeUrl,
      );

      return;
    }

    const { umsAccessToken } = tokenData;

    await deleteTokensByAccessToken(ctx, token);

    if (!systemLogout) {
      redirectToLogin(ctx, {}, baseFeUrl);

      return;
    }

    try {
      const response = await initiateUmsLogout(ctx, {
        redirectUri: `${baseFeUrl}${getResourceUrlPart(ctx)}/login`,
        token: umsAccessToken,
      });

      ctx.redirect(response.redirectTo);
    } catch (e) {
      ctx.logger.error(e, 'Failed to initiate ums logout');

      redirectToLogin(
        ctx,
        {
          error: 'Failed to finish logout',
          reqId: ctx.reqId,
        },
        baseFeUrl,
      );
    }
  });

  authRouter.get('/logincb', noCache, async (ctx) => {
    const { error, code } = ctx.query;
    const resource = await getResource(ctx);
    const serviceToken = await createToken(
      {},
      {
        audience: 'ums',
        subject: resource,
        requestId: ctx.reqId,
      },
    );
    const resourceInfo = await getResourceInfo(ctx, resource, serviceToken);
    const storedFeBaseUrl = await redis.get(`login:feBaseUrl:${ctx.reqId}`);
    let baseFeUrl = getBaseResourceFeUrl(ctx, resourceInfo);

    if (storedFeBaseUrl) {
      baseFeUrl = storedFeBaseUrl;
    }

    if (error) {
      ctx.logger.error(`Login failed: ${error}`);
      redirectToLogin(
        ctx,
        {
          error: 'Unauthorized',
          [TRACING_PARAM]: ctx.reqId,
        },
        baseFeUrl,
      );

      return;
    }

    try {
      let response;
      try {
        response = await exchangeUmsCodeForToken(ctx, {
          code,
          redirectUri: `${API_HOST}/v1/auth${getResourceUrlPart(ctx)}/logincb`,
          serviceToken,
        });
      } catch (err) {
        ctx.logger.error(err, 'Failed to request token');

        if (err.response) {
          ctx.logger.error(`Response: ${JSON.stringify(err.response.data)}`);
        }

        redirectToLogin(
          ctx,
          {
            error: 'Failed to login',
            [TRACING_PARAM]: ctx.reqId,
          },
          baseFeUrl,
        );

        return;
      }

      const umsUserTokens = response;
      const umsAccessToken = umsUserTokens.accessToken;
      const tokenDataInfo = await meUmsRequest(ctx, umsAccessToken);

      if (tokenDataInfo.errors && tokenDataInfo.errors.length > 0) {
        ctx.logger.error(tokenDataInfo.errors[0], 'Failed to request "me"');

        redirectToLogin(
          ctx,
          {
            error: 'Failed to login',
            [TRACING_PARAM]: ctx.reqId,
          },
          baseFeUrl,
        );

        return;
      }

      const tenantData = await getTenantData(ctx);
      const { customerId } = ctx.params;
      const me = {
        ...tokenDataInfo.data.me,
        ...tenantData,
        customerId: customerId ? parseInt(customerId, 10) : null,
      };
      const userTokens = await createUserTokens(umsUserTokens, me);

      const redirectParams = querystring.stringify({
        ...userTokens,
        [TRACING_PARAM]: ctx.reqId,
      });

      ctx.redirect(`${baseFeUrl}${getResourceUrlPart(ctx)}/finish-login?${redirectParams}`);
    } catch (e) {
      ctx.logger.error(e);

      redirectToLogin(
        ctx,
        {
          error: 'Failed to login',
          [TRACING_PARAM]: ctx.reqId,
        },
        baseFeUrl,
      );
    }
  });

  return authRouter;
};
