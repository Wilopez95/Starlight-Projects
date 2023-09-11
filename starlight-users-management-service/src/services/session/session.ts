import { Context } from '../../context';
import { generateRandomId } from '../crypto';
import { USER_IDENTITY_SESSION_MAX_AGE } from '../../config';
import { redisClient as redis } from '../redis';
import { clearSessionCookie, getSessionCookie, setSessionCookie } from '../cookies';
import { TokensWithRefresh, validateOrRefreshCognitoSession } from '../cognito';
import { parseDuration, toSeconds } from '../../utils/durations';
import { InvalidSession, SessionExpired, NoSession, InvalidExchangeCode } from './errors';

export const LOGIN_SESSION_EXPIRE_TIME = parseDuration('15m'); // 15 min in seconds

export interface UmsSessionData {
  /**
   * expiration timestamp, in seconds
   */
  exp: number;

  sessionId: string;

  [key: string]: unknown;
}

export interface UmsLoginSessionData extends UmsSessionData {
  redirectUri: string;
  resource: string;
  code: string;
  claims: string[];
  subject: string;
  requestId: string;
  tokenUse: string;
  userSessionId: string;
}

export interface UmsUserSessionData extends UmsSessionData {
  oidc: unknown;
  userId: string;
}

const getSessionKey = (sessionId: string): string => `session:${sessionId}`;

/**
 * It clears the session cookie and deletes the session from Redis
 * @param {Context} ctx - The context object that is passed to all Next.js API routes.
 * @returns A function that takes a context and returns a promise that resolves to void.
 */
export const clearSession = async (ctx: Context): Promise<void> => {
  const sessionCookie = getSessionCookie(ctx);

  clearSessionCookie(ctx);

  if (!sessionCookie) {
    return;
  }

  await redis.del(getSessionKey(sessionCookie));
};

/**
 * It gets the session data from Redis, checks if it's expired, and returns it
 * @param {Context} ctx - Context - the context object that is passed to the middleware
 * @param {string} sessionId - The session ID that was passed in the request.
 * @returns A promise that resolves to a UmsSessionData object.
 */
export const getSessionDataById = async (
  ctx: Context,
  sessionId: string,
): Promise<UmsSessionData> => {
  const sessionDataStr = await redis.get(getSessionKey(sessionId));

  if (!sessionDataStr) {
    if (sessionId) {
      await clearSession(ctx); // clean up if anything left
    }

    // TODO figure out what to do if session is missing
    throw new NoSession();
  }

  try {
    const sessionData = JSON.parse(sessionDataStr) as UmsSessionData;

    const expTime = sessionData.exp - toSeconds(Date.now());

    if (expTime < 1) {
      throw new SessionExpired();
    }

    return sessionData;
  } catch (e) {
    if (e instanceof SessionExpired) {
      throw e;
    }

    ctx.logger.error('Failed to parse session data', e);

    throw new InvalidSession();
  }
};

/**
 * It gets the session cookie from the context, and if it doesn't exist, it throws an error
 * @param {Context} ctx - Context - This is the context object that is passed to the handler function.
 * @returns A function that takes a Context and returns a string.
 */
export const getSessionId = (ctx: Context): string => {
  const sessionId = getSessionCookie(ctx);

  if (!sessionId) {
    throw new NoSession();
  }

  return sessionId;
};

/**
 * It gets the session ID from the request, and if it exists, it returns the session data
 * @param {Context} ctx - Context - this is the context object that is passed to all functions in the
 * microservice. It contains the request and response objects, as well as the sessionId.
 * @returns The session data for the user.
 */
export const getUserSessionData = async (ctx: Context): Promise<UmsUserSessionData> => {
  const sessionId = getSessionId(ctx);

  if (!sessionId) {
    throw new NoSession();
  }

  return (await getSessionDataById(ctx, sessionId)) as UmsUserSessionData;
};

/**
 * It gets the user session data from the database and stores it in the context object
 * @param {Context} ctx - Context - This is the context object that is passed to the function.
 */
export const validateUserSession = async (ctx: Context): Promise<void> => {
  await getUserSessionData(ctx);
};

/**
 * It gets the session data for a given session ID
 * @param {Context} ctx - The context object that is passed to the function.
 * @param {string} sessionId - The session ID of the session you want to get the data for.
 */
export const getLoginSessionData = async (
  ctx: Context,
  sessionId: string,
): Promise<UmsLoginSessionData> =>
  (await getSessionDataById(ctx, sessionId)) as UmsLoginSessionData;

/**
 * It generates a random session ID, sets a cookie with that ID, and stores the session data in Redis
 * @param {Context} ctx - The context object that is passed to the GraphQL resolver.
 * @param sessionData - Omit<UmsUserSessionData, 'sessionId'>,
 * @returns A string
 */
export const initUserSession = async (
  ctx: Context,
  sessionData: Omit<UmsUserSessionData, 'sessionId'>,
): Promise<string> => {
  const sessionId = generateRandomId();

  setSessionCookie(ctx, sessionId);

  await redis.set(
    getSessionKey(sessionId),
    JSON.stringify({
      ...sessionData,
      exp: toSeconds(Date.now()) + toSeconds(USER_IDENTITY_SESSION_MAX_AGE),
    }),
    'px',
    USER_IDENTITY_SESSION_MAX_AGE,
  );

  return sessionId;
};

/**
 * It creates a session in Redis, and returns the session ID
 * @param {Context} ctx - The context object of the current request.
 * @param {T} sessionData - The data that will be stored in the session.
 * @returns A string
 */
export const initLoginSession = async <
  T extends Omit<UmsLoginSessionData, 'sessionId' | 'exp' | 'code'>,
>(
  ctx: Context,
  sessionData: T,
): Promise<string> => {
  const sessionId = ctx.reqId;
  const exchangeCode = generateRandomId();

  await redis.set(
    getSessionKey(sessionId),
    JSON.stringify({
      ...sessionData,
      exp: toSeconds(Date.now()) + toSeconds(LOGIN_SESSION_EXPIRE_TIME),
      code: exchangeCode,
      sessionId,
    }),
    'px',
    LOGIN_SESSION_EXPIRE_TIME,
  );
  await redis.set(`login-exchange:${exchangeCode}`, sessionId, 'px', LOGIN_SESSION_EXPIRE_TIME);

  return sessionId;
};

/**
 * It stores the session data in Redis, and sets the expiration time to the time remaining until the
 * session expires
 * @param {UmsSessionData} sessionData - UmsSessionData
 */
export const storeSessionData = async (sessionData: UmsSessionData): Promise<void> => {
  const nextExp = sessionData.exp;

  const expTime = nextExp - toSeconds(Date.now());

  await redis.set(
    getSessionKey(sessionData.sessionId),
    JSON.stringify({
      ...sessionData,
      sessionId: sessionData.sessionId,
      exp: sessionData.exp,
    }),
    // EX used instead of PX because expiration here is in seconds.
    'ex',
    expTime,
  );
};

/**
 * It takes a session ID, and a partial session data object, and updates the session data in the
 * database
 * @param {Context} ctx - Context - The context object that is passed to the resolver.
 * @param {string} sessionId - The session ID of the user.
 * @param data - Partial<UmsSessionData>
 */
export const setSessionDataById = async (
  ctx: Context,
  sessionId: string,
  data: Partial<UmsSessionData>,
): Promise<void> => {
  const sessionData = await getSessionDataById(ctx, sessionId);

  await storeSessionData({
    ...sessionData,
    ...data,
    sessionId: sessionData.sessionId,
    exp: sessionData.exp,
  });
};

/**
 * It adds a user identity to a login session
 * @param {Context} ctx - Context - this is the context object that is passed to all functions in the
 * serverless.yml file.
 * @param {string} loginSessionId - The ID of the login session.
 * @param  - Context - the context object that is passed to all functions in the serverless function
 */
export const addIdentityToLoginSession = async (
  ctx: Context,
  loginSessionId: string,
  { userId, userSessionId }: { userId: string; userSessionId: string },
): Promise<void> => {
  await setSessionDataById(ctx, loginSessionId, {
    subject: userId,
    userSessionId,
  });
};

/**
 * It takes a code, looks up the corresponding login session ID in Redis, and then returns the session
 * data
 * @param {Context} ctx - The context object that is passed to all functions.
 * @returns The session data for the user.
 */
export const fulfillLoginSession = async (ctx: Context): Promise<UmsLoginSessionData> => {
  const { code } = ctx.request.body as Record<string, string | undefined>;

  ctx.logger.info(`Received code ${String(code)}`);

  if (!code) {
    throw new InvalidExchangeCode();
  }

  const redisKey = `login-exchange:${code}`;
  const loginSessionId = await redis.get(redisKey);

  if (!loginSessionId) {
    throw new InvalidExchangeCode();
  }

  const sessionData = (await getSessionDataById(ctx, loginSessionId)) as UmsLoginSessionData;

  await redis.del(redisKey);

  return sessionData;
};

/**
 * It sets the session data for the current user
 * @param {Context} ctx - The context object that is passed to all GraphQL resolvers.
 * @param data - Partial<Omit<UmsUserSessionData, 'sessionId'>>
 */
export const setUserSessionData = async (
  ctx: Context,
  data: Partial<Omit<UmsUserSessionData, 'sessionId'>>,
): Promise<void> => {
  const sessionId = getSessionId(ctx);

  if (!sessionId) {
    throw new NoSession();
  }

  await setSessionDataById(ctx, sessionId, data);
};

/**
 * It takes a sessionId, gets the session data from redis, validates the cognito session, and if it's
 * valid, returns. If it's not valid, it refreshes the session and stores the new session data in redis
 * @param {string} sessionId - The session ID that was returned from the login call.
 * @returns a promise that resolves to a void.
 */
export const validateUserSessionData = async (sessionId: string): Promise<void> => {
  const userSessionDataStr = await redis.get(getSessionKey(sessionId));

  if (!userSessionDataStr) {
    throw new Error('Invalid session');
  }

  const sessionData = JSON.parse(userSessionDataStr) as UmsUserSessionData;

  const oidcData = await validateOrRefreshCognitoSession(sessionData.oidc as TokensWithRefresh);

  if (oidcData === sessionData.oidc) {
    return;
  }

  await storeSessionData({
    ...sessionData,
    oidc: oidcData,
  });
};
