import Router from 'koa-router';
import axios from 'axios';
import querystring from 'querystring';
import bodyParser from 'koa-bodyparser';
import httpStatus from 'http-status';
import noCache from '../../middleware/noCache';
import { UMS_SERVICE_API_URL, TRACING_HEADER, TRACING_PARAM } from '../../config';
import logger from '../../services/logger';
import { Context, AppState } from '../../types/Context';
import { createToken } from '../../utils/serviceToken';
import {
  ResourceUserToken,
  createUserTokens,
  getUserTokenData,
  getUserRefreshTokenData,
  deleteTokensByAccessToken,
  deleteTokensByRefreshToken,
} from './tokens';

if (!UMS_SERVICE_API_URL) {
  throw new Error('Missing UMS_SERVICE_API_URL');
}

export interface RouterOptions {
  frontendUrl: string;
  coreFrontendUrl?: string;
  getResource(ctx: Context): string;
  getResourceUrlPart(ctx: Context): string;
}

export const buildAuthRouter = async ({
  frontendUrl,
  coreFrontendUrl,
  getResource,
  getResourceUrlPart,
}: RouterOptions): Promise<Router<AppState, Context>> => {
  const authRouter = new Router<AppState, Context>();

  if (!frontendUrl) {
    throw new Error('Missing frontendUrl');
  }

  const redirectToLogin = (ctx: Context, data: Record<string, string>) =>
    ctx.redirect(`${frontendUrl}/${getResourceUrlPart(ctx)}/login?${querystring.stringify(data)}`);

  const loginController = async (ctx: Context) => {
    if (!UMS_SERVICE_API_URL) {
      throw new Error('Missing UMS_SERVICE_API_URL');
    }

    const reqId = ctx.reqId;
    const serviceToken = await createToken(
      {},
      {
        audience: 'ums',
        subject: getResource(ctx),
        requestId: reqId,
      },
    );

    try {
      const response = await axios.post(
        `${UMS_SERVICE_API_URL}/auth/login`,
        {
          redirectUri: `${frontendUrl}/api/${getResourceUrlPart(ctx)}/logincb`,
          resource: getResource(ctx),
        },
        {
          headers: {
            Authorization: `ServiceToken ${serviceToken}`,
            [TRACING_HEADER]: reqId,
          },
        },
      );

      ctx.redirect(response.data.redirectTo);
    } catch (e) {
      ctx.logger.error(e);

      redirectToLogin(ctx, {
        error: 'Failed to start login session',
        [TRACING_PARAM]: reqId,
      });
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
      const refreshToken = ctx.request.body.refreshToken as string;

      if (!refreshToken) {
        ctx.throw(401, 'Invalid token');
      }

      const refreshData = await getUserRefreshTokenData(refreshToken, ctx);

      if (!refreshData) {
        ctx.throw(401, 'Invalid token');

        return;
      }

      const umsRefreshToken = refreshData.umsRefreshToken;

      try {
        const response = await axios.post(
          `${UMS_SERVICE_API_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${umsRefreshToken}`,
              [TRACING_HEADER]: ctx.reqId,
            },
          },
        );

        const umsUserTokens = response.data as ResourceUserToken;
        const umsAccessToken = umsUserTokens.accessToken;

        const tokenDataInfo = await axios.post(
          `${UMS_SERVICE_API_URL}/graphql`,
          {
            query: `query { me { id firstName lastName email resource permissions tenantId } }`,
          },
          {
            headers: {
              Authorization: `Bearer ${umsAccessToken}`,
              [TRACING_HEADER]: ctx.reqId,
            },
          },
        );

        await deleteTokensByRefreshToken(refreshToken, ctx);

        const userTokens = await createUserTokens(umsUserTokens, tokenDataInfo.data.data.me);

        ctx.body = {
          ...userTokens,
        };
      } catch (e) {
        ctx.logger.error('Failed to refresh token', e);

        ctx.throw(401, 'Failed to refresh token');
      }
    },
  );

  authRouter.get('/logout', noCache, async (ctx) => {
    const { token, systemLogout } = ctx.query;

    const tokenData = await getUserTokenData(token, ctx);

    if (!tokenData) {
      redirectToLogin(ctx, {
        error: 'Invalid token',
      });

      return;
    }

    const umsAccessToken = tokenData.umsAccessToken;

    await deleteTokensByAccessToken(token, ctx);

    if (!systemLogout) {
      redirectToLogin(ctx, {});

      return;
    }

    try {
      const redirectUri = coreFrontendUrl
        ? `${coreFrontendUrl}/lobby`
        : `${frontendUrl}/${getResourceUrlPart(ctx)}/login`;

      const response = await axios.post(
        `${UMS_SERVICE_API_URL}/auth/logout`,
        {
          redirectUri,
        },
        {
          headers: {
            Authorization: `Bearer ${umsAccessToken}`,
            [TRACING_HEADER]: ctx.reqId,
          },
        },
      );

      ctx.redirect(response.data.redirectTo);
    } catch (e) {
      ctx.logger.error('Failed to initiate ums logout', e);

      redirectToLogin(ctx, {
        error: 'Failed to finish logout',
        reqId: ctx.reqId,
      });
    }
  });

  authRouter.get('/logincb', noCache, async (ctx) => {
    const query = ctx.query;
    const error = query.error;

    if (error) {
      logger.error('Login failed: ' + error);
      redirectToLogin(ctx, {
        error: 'Unauthorized',
        [TRACING_PARAM]: ctx.reqId,
      });

      return;
    }

    const serviceToken = await createToken(
      {},
      {
        audience: 'ums',
        subject: getResource(ctx),
        requestId: ctx.reqId,
      },
    );

    try {
      const response = await axios.post(
        `${UMS_SERVICE_API_URL}/auth/token`,
        {
          code: query.code,
          redirectUri: `${frontendUrl}/api/${getResourceUrlPart(ctx)}/logincb`,
        },
        {
          headers: {
            Authorization: `ServiceToken ${serviceToken}`,
            [TRACING_HEADER]: ctx.reqId,
          },
        },
      );

      const umsUserTokens = response.data as ResourceUserToken;
      const umsAccessToken = umsUserTokens.accessToken;

      const tokenDataInfo = await axios.post(
        `${UMS_SERVICE_API_URL}/graphql`,
        {
          query: `query { me { id firstName lastName email resource permissions tenantId } }`,
        },
        {
          headers: {
            Authorization: `Bearer ${umsAccessToken}`,
            [TRACING_HEADER]: ctx.reqId,
          },
        },
      );

      const userTokens = await createUserTokens(umsUserTokens, tokenDataInfo.data.data.me);

      const redirect = `${frontendUrl}/${getResourceUrlPart(
        ctx,
      )}/finish-login?${querystring.stringify({
        ...userTokens,
        [TRACING_PARAM]: ctx.reqId,
      })}`;

      ctx.redirect(redirect);
    } catch (e) {
      ctx.logger.error(e, 'Failed to login');

      redirectToLogin(ctx, {
        error: 'Failed to login',
        [TRACING_PARAM]: ctx.reqId,
      });
    }
  });

  return authRouter;
};
