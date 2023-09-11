import querystring from 'querystring';
import Router from '@koa/router';
import { UMS_SERVICE_API_URL, TRACING_PARAM, API_HOST, FE_HOST } from '../../../config.js';
import {
  createServiceToken,
  createUserTokens,
  getUserTokenData,
  getUserRefreshTokenData,
  deleteTokensByAccessToken,
  deleteTokensByRefreshToken,
} from '../../../services/tokens.js';
import * as ums from '../../../services/ums.js';
import { client as redis } from '../../../services/redis.js';
import ApiError from '../../../errors/ApiError.js';

if (!UMS_SERVICE_API_URL) {
  throw new Error('Missing UMS_SERVICE_API_URL');
}

const getFrontendUrl = ctx => {
  if (ctx.headers.referer) {
    const url = new URL(ctx.headers.referer);

    return `${url.protocol}//${url.host}`;
  }

  return FE_HOST;
};

export const buildAuthRouter = options => {
  const { getResource, getResourceUrlPart, redirectToLogin: redirectToLoginParam } = options;
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
      token = await createServiceToken(
        {},
        {
          audience: 'ums',
          subject: resource,
          requestId: ctx.state.reqId,
        },
      );
    }

    const response = await ums.fetchResourceInfo(ctx, { srn: resource, serviceToken: token });

    if (response.errors) {
      return null;
    }

    return response.data.resource;
  };

  const redirectToLogin =
    redirectToLoginParam ||
    ((ctx, data, baseUrl) =>
      ctx.redirect(`${baseUrl}${getResourceUrlPart(ctx)}/login?${querystring.stringify(data)}`));

  const loginController = async ctx => {
    if (!UMS_SERVICE_API_URL) {
      throw new Error('Missing UMS_SERVICE_API_URL');
    }

    const { reqId } = ctx.state;
    const resource = await getResource(ctx);
    const serviceToken = await createServiceToken(
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
      const response = await ums.initLogin(ctx, {
        redirectUri: `${API_HOST}/api/v1/auth${getResourceUrlPart(ctx)}/logincb`,
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

  authRouter.get('/login', loginController);
  authRouter.post('/login', loginController);

  authRouter.post('/refresh', async ctx => {
    const { refreshToken } = ctx.request.body;

    if (!refreshToken) {
      throw ApiError.notAuthenticated();
    }

    const refreshData = await getUserRefreshTokenData(ctx, refreshToken);

    if (!refreshData) {
      throw ApiError.notAuthenticated();
    }

    const { umsRefreshToken } = refreshData;

    try {
      const umsUserTokens = await ums.refreshToken(ctx, umsRefreshToken);
      const umsAccessToken = umsUserTokens.accessToken;

      const tokenDataInfo = await ums.meRequest(ctx, umsAccessToken);

      await deleteTokensByRefreshToken(ctx, refreshToken);

      const userTokens = await createUserTokens(umsUserTokens, tokenDataInfo.data.me);

      ctx.body = {
        ...userTokens,
      };
    } catch (e) {
      ctx.logger.error(e, 'Failed to refresh token');

      throw ApiError.notAuthenticated();
    }
  });

  authRouter.get('/logout', async ctx => {
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
      const response = await ums.initLogout(ctx, {
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
          reqId: ctx.state.reqId,
        },
        baseFeUrl,
      );
    }
  });

  authRouter.get('/logincb', async ctx => {
    const { error, code, postAuth } = ctx.query;
    const resource = await getResource(ctx);
    const serviceToken = await createServiceToken(
      {},
      {
        audience: 'ums',
        subject: resource,
        requestId: ctx.state.reqId,
      },
    );
    const resourceInfo = await getResourceInfo(ctx, resource, serviceToken);
    const storedFeBaseUrl = await redis.get(`login:feBaseUrl:${ctx.state.reqId}`);
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
          [TRACING_PARAM]: ctx.state.reqId,
        },
        baseFeUrl,
      );

      return;
    }

    try {
      let response;
      try {
        response = await ums.exchangeCodeForToken(ctx, {
          code,
          redirectUri: `${API_HOST}/api/v1/auth${getResourceUrlPart(ctx)}/logincb`,
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
            [TRACING_PARAM]: ctx.state.reqId,
          },
          baseFeUrl,
        );

        return;
      }

      const umsUserTokens = response;
      const umsAccessToken = umsUserTokens.accessToken;

      const tokenDataInfo = await ums.meRequest(ctx, umsAccessToken);

      if (tokenDataInfo.errors && tokenDataInfo.errors.length > 0) {
        ctx.logger.error(tokenDataInfo.errors[0], 'Failed to request "me"');

        redirectToLogin(
          ctx,
          {
            error: 'Failed to login',
            [TRACING_PARAM]: ctx.state.reqId,
          },
          baseFeUrl,
        );

        return;
      }

      const { me } = tokenDataInfo.data;

      const userTokens = await createUserTokens(umsUserTokens, me);

      const redirectParams = querystring.stringify({
        ...userTokens,
        postAuth: postAuth === 'true' || postAuth === true,
        [TRACING_PARAM]: ctx.state.reqId,
      });

      ctx.redirect(`${baseFeUrl}${getResourceUrlPart(ctx)}/finish-login?${redirectParams}`);
    } catch (e) {
      ctx.logger.error(e);

      redirectToLogin(
        ctx,
        {
          error: 'Failed to login',
          [TRACING_PARAM]: ctx.state.reqId,
        },
        baseFeUrl,
      );
    }
  });

  return authRouter;
};
