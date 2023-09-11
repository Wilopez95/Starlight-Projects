/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import querystring from 'querystring';
import { AuthenticationError, UserInputError } from 'apollo-server-core';

import { type Context } from '../../context';
import { User } from '../../entities/User';

import {
  exchangeCodeForTokens,
  refreshToken,
  getLoginUri,
  getLogoutUri,
  TokensWithRefresh,
} from '../../services/cognito';
import { getSessionCookie } from '../../services/cookies';
import { generateRandomId } from '../../services/crypto';
import {
  initLoginSession,
  getUserSessionData,
  NoSession,
  clearSession,
  initUserSession,
  getSessionId,
} from '../../services/session';
import {
  buildServiceRedirectUri,
  buildUmsRedirectUri,
  createResourceUserToken,
  extractFromHeaders,
  refreshResourceUserToken,
} from '../../services/token';
import * as tokenStorage from '../../services/tokenStorage';
import { TRACING_PARAM } from '../../config';
import { SessionExpired } from '../../services/session/errors';
import {
  addIdentityToLoginSession,
  fulfillLoginSession,
  setUserSessionData,
} from '../../services/session/session';
import { publishUserLogoutEvent } from '../../services/amqp/client';
import { readState } from './utils';

export const initiateLogin = async (ctx: Context): Promise<void> => {
  const {
    redirectUri,
    resource,
    claims = '',
  } = ctx.request.body as Record<string, string | undefined>;

  if (!redirectUri || !resource) {
    throw new AuthenticationError('redirectUri is required');
  }

  const sessionId = await initLoginSession(ctx, {
    redirectUri,
    resource,
    claims: claims
      .split(' ')
      .map(s => s.trim())
      .filter(Boolean),
    subject: '',
    requestId: ctx.reqId,
  });

  ctx.body = {
    // @ts-expect-error
    redirectTo: buildUmsRedirectUri(ctx.router.url('performLogin'), sessionId),
  };
};

export const initiateLogout = async (ctx: Context): Promise<void> => {
  const { redirectUri } = ctx.request.body as Record<string, string | undefined>;

  if (!redirectUri) {
    ctx.throw(400, 'redirectUri is required');
  }

  try {
    // eslint-disable-next-line no-new
    new URL(redirectUri); // TODO figure out better validation
    // this way allows to pass through following invalid url: http://http://somehost.com/dsfsd/fff
  } catch (error) {
    ctx.throw(400, 'redirectUri must be a valid URL');
  }

  if (!ctx.userInfo) {
    ctx.throw(400, 'Invalid token');
  }

  const state = generateRandomId();
  await tokenStorage.saveLogoutState(state, redirectUri);

  await publishUserLogoutEvent(ctx);

  ctx.body = {
    // @ts-expect-error aasdf
    redirectTo: buildUmsRedirectUri(ctx.router.url('performLogout'), state),
  };
};

export const performLogout = async (ctx: Context): Promise<void> => {
  const { state } = ctx.request.query as Record<string, string | undefined>;

  if (!state) {
    ctx.throw(400, 'State is required');
  }

  const redirectUri = await tokenStorage.getAndDeleteLogoutState(state);

  if (!redirectUri) {
    ctx.throw(400, 'Invalid state');
  }

  const sessionId = getSessionCookie(ctx);

  if (!sessionId) {
    ctx.logger.info('User already logged out');

    ctx.redirect(redirectUri);

    return;
  }

  await tokenStorage.saveLogoutState(sessionId, redirectUri);

  ctx.redirect(
    // @ts-expect-error
    getLogoutUri({ logoutUri: buildUmsRedirectUri(ctx.router.url('logoutCallback'), '') }),
  );
};

export const logoutCallback = async (ctx: Context): Promise<void> => {
  const sessionId = getSessionCookie(ctx);

  if (!sessionId) {
    ctx.logger.error('Missing session at logout callback');

    ctx.throw(400, 'No session');
  }

  const redirectUri = await tokenStorage.getAndDeleteLogoutState(sessionId);

  if (!redirectUri) {
    ctx.logger.error('Missing redirect URI at logout callback');

    ctx.throw(400, 'Invalid state');
  }

  await clearSession(ctx);

  ctx.redirect(redirectUri);
};

export const performLogin = async (ctx: Context): Promise<void> => {
  const stateData = await readState(ctx);

  const redirectToLogin = (): void => {
    ctx.redirect(
      getLoginUri({
        redirectUri: `${ctx.router.url('loginCallback')}`,
        state: stateData.sessionId,
      }),
    );
  };

  try {
    // if the user already has a session with ums
    const userSession = await getUserSessionData(ctx);
    const oidcData = userSession.oidc as TokensWithRefresh;

    try {
      const newOidcData = await refreshToken(oidcData.refreshToken);
      const sessionId = getSessionId(ctx);
      const { decoded } = newOidcData;
      const userId = decoded.sub;

      await setUserSessionData(ctx, {
        ...userSession,
        oidc: newOidcData,
        exp: decoded.exp,
      });
      await addIdentityToLoginSession(ctx, stateData.sessionId, {
        userId,
        userSessionId: sessionId,
      });
    } catch (e) {
      ctx.logger.error('Failed to refresh token', e);

      await clearSession(ctx);

      throw new NoSession();
    }

    ctx.redirect(
      buildServiceRedirectUri(stateData.redirectUri, {
        code: stateData.code,
        exp: stateData.exp,
        [TRACING_PARAM]: ctx.reqId,
      }),
    );
  } catch (e) {
    if (!(e instanceof NoSession) && !(e instanceof SessionExpired)) {
      ctx.logger.error(e as Error, 'Failed to perform login');

      ctx.redirect(
        buildServiceRedirectUri(stateData.redirectUri, {
          error: 'Failed to login with existing session',
          [TRACING_PARAM]: ctx.reqId,
        }),
      );

      throw e;
    }

    // if the user has no a session with ums yet
    // redirect to OIDC.
    redirectToLogin();
  }
};

export const refresh = async (ctx: Context): Promise<void> => {
  const userRefreshToken = extractFromHeaders(ctx.headers);

  if (!userRefreshToken) {
    throw new Error('Invalid token');
  }

  try {
    const tokens = await refreshResourceUserToken(userRefreshToken);

    ctx.body = tokens;
    ctx.status = 200;
  } catch (e) {
    ctx.throw(401, e as Error);
  }
};

export const loginCallback = async (ctx: Context): Promise<void> => {
  const { code } = ctx.query as { code: string };

  const stateData = await readState(ctx);

  ctx.logger.info('Exchanging auth code for tokens');

  let tokens: TokensWithRefresh;

  try {
    // @ts-expect-error
    tokens = await exchangeCodeForTokens(ctx, code, ctx.router.url('loginCallback'));
  } catch (error) {
    ctx.logger.error(error as Error, 'Failed to obtain ID and refresh tokens');

    ctx.redirect(
      `${stateData.redirectUri}?${querystring.stringify({
        error: 'Failed to obtain token',
        [TRACING_PARAM]: ctx.reqId,
      })}`,
    );

    return;
  }

  const { decoded } = tokens;
  const userId = decoded.sub;

  const userSessionId = await initUserSession(ctx, {
    oidc: tokens,
    userId,
  });

  const user = await User.findOne(userId);

  if (!user) {
    ctx.logger.error('User not found');

    ctx.redirect(
      `${stateData.redirectUri}?${querystring.stringify({
        error: 'User not found',
        [TRACING_PARAM]: ctx.reqId,
      })}`,
    );

    return;
  }

  await addIdentityToLoginSession(ctx, stateData.sessionId, { userId, userSessionId });

  const redirectUrl = buildServiceRedirectUri(stateData.redirectUri, {
    code: stateData.code,
    postAuth: 'true',
    [TRACING_PARAM]: ctx.reqId,
  });

  ctx.redirect(redirectUrl);
};

export const exchangeUmsCodeForToken = async (ctx: Context): Promise<void> => {
  const { redirectUri } = ctx.request.body as Record<string, string | undefined>;

  if (!ctx.serviceToken) {
    ctx.throw(400, 'No Service Token');
  }

  const { sub } = ctx.serviceToken;

  const stateData = await fulfillLoginSession(ctx);

  if (!stateData) {
    ctx.logger.error('State data not found; possible replay attack');

    ctx.throw(400, 'Failed to obtain token');
  }

  if (!stateData.subject) {
    ctx.logger.error('User ID missing from state');

    ctx.throw(400, 'Invalid state');
  }

  if (
    stateData.redirectUri !== redirectUri ||
    stateData.resource !== sub ||
    stateData.requestId !== ctx.reqId
  ) {
    if (stateData.redirectUri !== redirectUri) {
      ctx.logger.error(
        `State validation failed on: stateData.redirectUri(${
          stateData.redirectUri
        }) !== redirectUri(${redirectUri || ''})`,
      );
    } else if (stateData.resource !== sub) {
      ctx.logger.error(
        `State validation failed on: stateData.resource(${stateData.resource}) !== sub(${sub})`,
      );
    } else if (stateData.requestId !== ctx.reqId) {
      ctx.logger.error(
        `State validation failed on: stateData.requestId(${stateData.requestId}) !== ctx.reqId(${ctx.reqId})`,
      );
    } else {
      ctx.logger.error(`State validation failed, should log this. Must investigate`);
    }

    ctx.logger.error('State validation failed');

    throw new UserInputError('Invalid state');
  }

  const user = await User.findOne(stateData.subject, {
    relations: ['roles', 'roles.policies', 'policies'],
  });

  if (!user) {
    ctx.logger.warn(`User missing after userId initialized to ${stateData.subject} in state`);

    ctx.throw(400, 'Failed to obtain token');
  }

  const tokens = await createResourceUserToken(user, stateData);

  ctx.body = tokens;
  ctx.status = 200;
};
