import querystring from 'querystring';
import { Router } from 'express';
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
import { client as redis } from '../services/redis/index.js';
import { UnauthorizedError } from '../services/error/index.js';
import asyncWrap from '../utils/asyncWrap.js';
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

export const buildAuthRouter = options => {
  const {
    getFrontendUrl,
    getResource,
    getResourceUrlPart,
    redirectToLogin: redirectToLoginParam,
  } = options;
  const authRouter = new Router({ mergeParams: true });

  if (!getFrontendUrl) {
    throw new Error('Missing getFrontendUrl');
  }

  const getBaseResourceFeUrl = (req, resourceInfo) => {
    const loginUrl = resourceInfo?.loginUrl;

    if (!loginUrl) {
      return getFrontendUrl(req);
    }

    try {
      const url = new URL(loginUrl);

      return `${url.protocol}//${url.host}`;
    } catch {
      return getFrontendUrl(req);
    }
  };

  const getResourceInfo = async (req, resource, serviceToken) => {
    let token = serviceToken;

    if (!token) {
      token = await createToken(
        {},
        {
          audience: 'ums',
          subject: resource,
          requestId: req.reqId,
        },
      );
    }

    const response = await fetchUmsResourceInfo(req, { srn: resource, serviceToken: token });

    if (response.errors) {
      return null;
    }

    return response.data.resource;
  };

  const redirectToLogin =
    redirectToLoginParam ||
    ((req, res, data, baseUrl) =>
      res.redirect(`${baseUrl}${getResourceUrlPart(req)}/login?${querystring.stringify(data)}`));

  const loginController = asyncWrap(async (req, res) => {
    if (!UMS_URL) {
      throw new Error('Missing UMS_URL');
    }

    const { reqId } = req;
    const resource = getResource(req);
    const serviceToken = await createToken(
      {},
      {
        audience: 'ums',
        subject: resource,
        requestId: reqId,
      },
    );
    const resourceInfo = await getResourceInfo(req, resource, serviceToken);
    const resourceBaseFeUrl = getBaseResourceFeUrl(req, resourceInfo);

    try {
      const response = await initiateUmsLogin(req, {
        redirectUri: `${API_HOST}/v1/auth${getResourceUrlPart(req)}/logincb`,
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

      res.redirect(response.redirectTo);
    } catch (e) {
      req.logger.error(e);

      redirectToLogin(
        req,
        res,
        {
          error: 'Failed to start login session',
          [TRACING_PARAM]: reqId,
        },
        resourceBaseFeUrl,
      );
    }
  });

  authRouter.get('/login', noCache, loginController);
  authRouter.post('/login', noCache, loginController);

  authRouter.post(
    '/refresh',
    noCache,
    asyncWrap(async (req, res) => {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new UnauthorizedError();
      }

      const refreshData = await getUserRefreshTokenData(refreshToken);

      if (!refreshData) {
        throw new UnauthorizedError();
      }

      const { umsRefreshToken } = refreshData;

      try {
        const umsUserTokens = await refreshUmsToken(req, umsRefreshToken);
        const umsAccessToken = umsUserTokens.accessToken;

        const tokenDataInfo = await meUmsRequest(req, umsAccessToken);

        await deleteTokensByRefreshToken(refreshToken);

        const me = {
          ...tokenDataInfo.data.me,
        };
        const userTokens = await createUserTokens(umsUserTokens, me);

        res.send(userTokens);
      } catch (e) {
        req.logger.error('Failed to refresh token', e);

        throw new UnauthorizedError();
      }
    }),
  );

  authRouter.get(
    '/logout',
    noCache,
    asyncWrap(async (req, res) => {
      const { token, systemLogout } = req.query;
      const resource = getResource(req);
      const resourceInfo = await getResourceInfo(req, resource);
      const baseFeUrl = getBaseResourceFeUrl(req, resourceInfo);

      const tokenData = await getUserTokenData(token);

      if (!tokenData) {
        redirectToLogin(
          req,
          res,
          {
            error: 'Invalid token',
          },
          baseFeUrl,
        );

        return;
      }

      const { umsAccessToken } = tokenData;

      await deleteTokensByAccessToken(token);

      if (!systemLogout) {
        redirectToLogin(req, res, {}, baseFeUrl);

        return;
      }

      try {
        const response = await initiateUmsLogout(req, {
          redirectUri: `${baseFeUrl}${getResourceUrlPart(req)}/login`,
          token: umsAccessToken,
        });

        res.redirect(response.redirectTo);
      } catch (e) {
        req.logger.error(e, 'Failed to initiate ums logout');

        redirectToLogin(
          req,
          res,
          {
            error: 'Failed to finish logout',
            reqId: req.reqId,
          },
          baseFeUrl,
        );
      }
    }),
  );

  authRouter.get(
    '/logincb',
    noCache,
    asyncWrap(async (req, res) => {
      const { error, code } = req.query;
      const resource = getResource(req);
      const serviceToken = await createToken(
        {},
        {
          audience: 'ums',
          subject: resource,
          requestId: req.reqId,
        },
      );
      const resourceInfo = await getResourceInfo(req, resource, serviceToken);
      const storedFeBaseUrl = await redis.get(`login:feBaseUrl:${req.reqId}`);
      let baseFeUrl = getBaseResourceFeUrl(req, resourceInfo);

      if (storedFeBaseUrl) {
        baseFeUrl = storedFeBaseUrl;
      }

      if (error) {
        req.logger.error(`Login failed: ${error}`);
        redirectToLogin(
          req,
          res,
          {
            error: 'Unauthorized',
            [TRACING_PARAM]: req.reqId,
          },
          baseFeUrl,
        );

        return;
      }

      try {
        let response;
        try {
          response = await exchangeUmsCodeForToken(req, {
            code,
            redirectUri: `${API_HOST}/v1/auth${getResourceUrlPart(req)}/logincb`,
            serviceToken,
          });
        } catch (err) {
          req.logger.error(err, 'Failed to request token');

          if (err.response) {
            req.logger.error(`Response: ${JSON.stringify(err.response.data)}`);
          }

          redirectToLogin(
            req,
            res,
            {
              error: 'Failed to login',
              [TRACING_PARAM]: req.reqId,
            },
            baseFeUrl,
          );

          return;
        }

        const umsUserTokens = response;
        const umsAccessToken = umsUserTokens.accessToken;
        const tokenDataInfo = await meUmsRequest(req, umsAccessToken);

        if (tokenDataInfo.errors && tokenDataInfo.errors.length > 0) {
          req.logger.error(tokenDataInfo.errors[0], 'Failed to request "me"');

          redirectToLogin(
            req,
            res,
            {
              error: 'Failed to login',
              [TRACING_PARAM]: req.reqId,
            },
            baseFeUrl,
          );

          return;
        }

        const me = {
          ...tokenDataInfo.data.me,
        };
        const userTokens = await createUserTokens(umsUserTokens, me);

        const redirectParams = querystring.stringify({
          ...userTokens,
          [TRACING_PARAM]: req.reqId,
        });

        res.redirect(`${baseFeUrl}${getResourceUrlPart(req)}/finish-login?${redirectParams}`);
      } catch (e) {
        req.logger.error(e);

        redirectToLogin(
          req,
          res,
          {
            error: 'Failed to login',
            [TRACING_PARAM]: req.reqId,
          },
          baseFeUrl,
        );
      }
    }),
  );

  return authRouter;
};
