import { createSecretKey } from 'crypto';
import querystring from 'querystring';
import paseto from 'paseto';

import { User } from '../entities/User';
import { API_BASE, RESOURCE_TOKEN_LIFETIME, TOKEN_SECRET, REFRESH_TOKEN_LIFETIME } from '../config';
import { type UserInfo } from '../context';
import { parseDuration, toSeconds } from '../utils/durations';
import { CognitoIdentityToken } from './cognito';
import { createToken, CreateTokenOptions } from './serviceToken';
import { UmsLoginSessionData, validateUserSessionData } from './session';
import { redisClient as redis } from './redis';
import { adaptAccessConfig, adaptActionsList } from './policyAdapter';

type TokenPayload = Omit<UserInfo, 'id' | 'access'> & {
  sub?: string;
  permissions?: string[];
};

if (!TOKEN_SECRET) {
  throw new Error('Missing TOKEN_SECRET');
}

const key = createSecretKey(Buffer.from(TOKEN_SECRET, 'base64'));

if (key.symmetricKeySize !== 32) {
  throw new Error('TOKEN_SECRET must be base64-encoded 32-byte long secret');
}

/**
 * It takes a token and a set of options, and returns a user object
 * @param {string} token - The token to decrypt.
 * @param  Options - `allowExpired`: Whether to allow expired tokens.
 * @returns The user info object.
 */
export const decryptToken = async (
  token: string,
  { allowExpired = false } = {},
): Promise<UserInfo> => {
  const decrypted = await paseto.V2.decrypt(token, key, {
    audience: API_BASE,
    issuer: API_BASE,
    ignoreExp: allowExpired,
  });

  const {
    sub: id,
    name,
    email,
    tenantId,
    tenantName,
    resource,
    permissions,
  } = decrypted as TokenPayload;

  return {
    id,
    name,
    email,
    tenantId,
    tenantName,
    resource,
    access: permissions ? adaptActionsList(permissions) : {},
  };
};

/**
 * It takes a CognitoIdentityToken and a CreateTokenOptions object, and returns a token string
 * @param {CognitoIdentityToken} payload - The token returned by the Cognito Identity service.
 * @param {CreateTokenOptions} tokenOptions - CreateTokenOptions
 * @returns A token.
 */
export const createUmsTokenFromCognito = async (
  payload: CognitoIdentityToken,
  tokenOptions: CreateTokenOptions,
): Promise<string> =>
  createToken(
    {
      userId: payload.sub,
      name: payload.name,
      email: payload.email,
      tenantId: payload['custom:tenantId'],
      tenantName: payload['custom:tenantName'],
    },
    tokenOptions,
  );

export enum TokenClaim {
  NAME = 'name',
  EMAIL = 'email',
  TENANT_ID = 'tenantId',
  TENANT_NAME = 'tenantName',
  RESOURCE = 'resource',
  PERMISSIONS = 'permissions',
}

export interface ResourceUserToken {
  accessToken: string;
  accessExp: number;
  refreshToken: string;
  refreshNumber: string;
}

/**
 * It takes a user and a resource, and creates a token for that user and resource
 * @param {User} user - User
 * @param {UmsLoginSessionData} loginData - UmsLoginSessionData
 * @returns The access token, the refresh token, and the expiry times.
 */
export const createResourceUserToken = async (
  user: User,
  loginData: UmsLoginSessionData,
): Promise<{
  accessToken: string;
  accessTokenExp: number;
  refreshToken: string;
  refreshTokenExp: number;
}> => {
  // TODO get rid of scope and minimize token
  const tokentPayload = loginData.claims.reduce(
    (acc: Record<string, unknown>, scope: string) => {
      // eslint-disable-next-line default-case
      switch (scope.trim()) {
        case TokenClaim.EMAIL:
          acc[TokenClaim.EMAIL] = user.email;
          break;

        case TokenClaim.NAME:
          acc[TokenClaim.NAME] = user.name;
          break;

        case TokenClaim.TENANT_ID:
          acc[TokenClaim.TENANT_ID] = user.tenantId;
          break;

        case TokenClaim.TENANT_NAME:
          acc[TokenClaim.TENANT_NAME] = user.tenantName;
          break;

        case TokenClaim.PERMISSIONS:
          acc[TokenClaim.PERMISSIONS] = adaptAccessConfig(
            user.getPermissionsForResource(loginData.resource),
          );
          break;
      }

      return acc;
    },
    {
      userId: user.id,
      [TokenClaim.RESOURCE]: loginData.resource,
    },
  );

  const now = toSeconds(Date.now());

  const expiresIn = parseDuration(RESOURCE_TOKEN_LIFETIME);
  const refreshExpiresIn = parseDuration(REFRESH_TOKEN_LIFETIME);
  const accessTokenExp = now + toSeconds(expiresIn);
  const refreshTokenExp = now + toSeconds(refreshExpiresIn);

  const [accessToken, refreshToken] = await Promise.all([
    paseto.V2.encrypt(
      {
        ...tokentPayload,
        tokenUse: 'bearer',
      },
      key,
      {
        issuer: API_BASE,
        audience: API_BASE,
        subject: user.id,
        expiresIn: RESOURCE_TOKEN_LIFETIME,
      },
    ),
    paseto.V2.encrypt(
      {
        ...tokentPayload,
        tokenUse: 'refresh',
      },
      key,
      {
        issuer: API_BASE,
        audience: API_BASE,
        subject: user.id,
        expiresIn: REFRESH_TOKEN_LIFETIME,
      },
    ),
  ]);

  const userId = tokentPayload.userId as string;
  const resource = tokentPayload.resource as string;

  await redis.set(
    `user-resource-token:${userId}:${resource}`,
    JSON.stringify(loginData),
    'px',
    refreshExpiresIn,
  );

  return {
    accessToken,
    accessTokenExp,
    refreshToken,
    refreshTokenExp,
  };
};

/**
 * Given a refresh token,
 * it will return a new access token and refresh token
 * @param {string} token - The token to refresh.
 * @returns The access token, the access token expiry, the refresh token, and the refresh token expiry.
 */
export const refreshResourceUserToken = async (
  token: string,
): Promise<{
  accessToken: string;
  accessTokenExp: number;
  refreshToken: string;
  refreshTokenExp: number;
}> => {
  // TODO add reuse detection and invalidate session on reuse
  const tokenPayload = (await paseto.V2.decrypt(token, key, {
    audience: API_BASE,
    issuer: API_BASE,
  })) as Record<string, string | number>;

  if ((tokenPayload.tokenUse as string) !== 'refresh') {
    throw new Error('Invalid token');
  }

  const userId = tokenPayload.userId as string;
  const resource = tokenPayload.resource as string;
  const loginDataStr = await redis.get(`user-resource-token:${userId}:${resource}`);

  if (!loginDataStr) {
    throw new Error('Invalid token');
  }

  const loginData = JSON.parse(loginDataStr) as UmsLoginSessionData;

  const user = await User.findOne(loginData.subject);

  if (!user) {
    throw new Error('Invalid token');
  }

  await validateUserSessionData(loginData.userSessionId);

  return createResourceUserToken(user, loginData);
};

/**
 * Builds a redirect URI for the UMS
 * @param {string} path - The path to redirect to after the user has successfully authenticated.
 * @param {string} state - A string that will be passed back to the application when the user returns
 * to it after authenticating.
 * @returns A URL string.
 */
export const buildUmsRedirectUri = (path: string, state: string): string => {
  const redirectTo = new URL(path, API_BASE);

  if (state) {
    redirectTo.search = `state=${state}`;
  }

  return redirectTo.toString();
};

/**
 * Given a URI and a set of parameters, return a URI with the parameters encoded
 * @param {string} uri - The URI to redirect to.
 * @param params - Record<string, string | number>
 * @returns A URL
 */
export const buildServiceRedirectUri = (
  uri: string,
  params: Record<string, string | number>,
): string => {
  const redirectTo = new URL(uri);

  redirectTo.search = querystring.stringify(params);

  return redirectTo.toString();
};

const AUTHORIZATION_HEADER_REGEXP = /^Bearer (?<token>.+)$/;

/**
 * Extracts the token from the Authorization header
 * @param headers - The headers of the request.
 * @returns The token extracted from the Authorization header.
 */
export const extractFromHeaders = (
  headers: Record<string, string | string[] | undefined>,
): string | undefined => {
  const { authorization } = headers;

  if (!authorization || Array.isArray(authorization)) {
    return;
  }

  const match = AUTHORIZATION_HEADER_REGEXP.exec(authorization);

  if (!match?.groups?.token) {
    return;
  }

  return match.groups.token;
};
