import querystring from 'querystring';
import AWS, { AWSError } from 'aws-sdk';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_COGNITO_REGION,
  AWS_COGNITO_USER_POOL_ID,
  AWS_COGNITO_CLIENT_ID,
  AWS_COGNITO_CLIENT_SECRET,
  AWS_COGNITO_DOMAIN,
  API_BASE,
} from '../config';
import { Context } from '../context';
import { logger, Logger } from './logger';

if (
  AWS_ACCESS_KEY_ID === undefined ||
  AWS_SECRET_ACCESS_KEY === undefined ||
  AWS_COGNITO_USER_POOL_ID === undefined ||
  AWS_COGNITO_CLIENT_ID === undefined ||
  AWS_COGNITO_CLIENT_SECRET === undefined ||
  AWS_COGNITO_DOMAIN === undefined
) {
  throw new Error('AWS access keys and user pool ID are required!');
}

const accessKeyId = AWS_ACCESS_KEY_ID;
const secretAccessKey = AWS_SECRET_ACCESS_KEY;
const userPoolId = AWS_COGNITO_USER_POOL_ID;
const cognitoDomain = AWS_COGNITO_DOMAIN;
const clientId = AWS_COGNITO_CLIENT_ID;
const clientSecret = AWS_COGNITO_CLIENT_SECRET;

const cognitoClient = new AWS.CognitoIdentityServiceProvider({
  apiVersion: '2016-04-18',
  region: AWS_COGNITO_REGION,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

interface GetLoginUriParams {
  state: string;
  redirectUri: string;
}

interface GetLogoutUriParams {
  logoutUri: string;
}

/**
 * It returns the logout URI for the user
 * @param {GetLogoutUriParams}  - `logoutUri` is the URL that the user will be redirected to after
 * logging out.
 */
export const getLogoutUri = ({ logoutUri }: GetLogoutUriParams): string =>
  new URL(
    `/logout?${querystring.stringify({
      client_id: clientId,
      logout_uri: logoutUri,
    })}`,
    cognitoDomain,
  ).toString();

/**
 * It returns a URL that can be used to redirect the user to the Cognito login page
 * @param {GetLoginUriParams}  - * **response_type**: The response type is `code` which is the only
 * response type that is supported by the Cognito User Pool.
 */
export const getLoginUri = ({ redirectUri, state }: GetLoginUriParams): string =>
  new URL(
    `/oauth2/authorize?${querystring.stringify({
      response_type: 'code',
      response_mode: 'query',
      client_id: clientId,
      redirect_uri: new URL(redirectUri, API_BASE).toString(),
      state,
    })}`,
    cognitoDomain,
  ).toString();

interface CreateUserParams {
  email: string;
  name: string;
  tenantId?: string;
  tenantName?: string;
  temporaryPassword?: string;
}

type AttributeList = AWS.CognitoIdentityServiceProvider.AttributeListType;

/**
 * Given an object, return an array of objects with the Name and Value properties
 * @param object - The object to convert to an attribute list.
 */
const toAttributeList = (
  object: Record<string, string | number | boolean | undefined | null>,
): AttributeList =>
  Object.entries(object)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => ({ Name: key, Value: String(value) }));

/**
 * Get the value of an attribute from a list of attributes
 * @param {AttributeList} attributeList - The list of attributes that are associated with the resource.
 * @param {string} key - The name of the attribute you want to get.
 */
const getAttribute = (attributeList: AttributeList, key: string) =>
  attributeList.find(({ Name }) => Name === key)?.Value;

export class UserCreationFailedError extends Error {
  name = 'UserCreationFailedError';
}

/**
 * If the user doesn't exist, create the user
 * @param {CreateUserParams}  - email - The email address of the user. name - The name of the user.
 * tenantId - The id of the tenant that the user belongs to.tenantName - The name of the tenant that the user belongs to.
 * temporaryPassword- The temporary password that the user will use to log in
 * @returns The user's ID.
 */
export const createUserIfNotExists = async ({
  email,
  name,
  tenantId,
  tenantName,
  temporaryPassword,
}: CreateUserParams): Promise<string> => {
  let attributes: AttributeList | undefined;
  try {
    const { User } = await cognitoClient
      .adminCreateUser({
        UserPoolId: userPoolId,
        Username: email,
        UserAttributes: toAttributeList({
          name,
          email,
          'custom:tenantId': tenantId,
          'custom:tenantName': tenantName,
          email_verified: true,
        }),
        TemporaryPassword: temporaryPassword,
      })
      .promise();

    attributes = User?.Attributes;
  } catch (error: unknown) {
    const { code } = error as AWSError;

    if (code !== 'UsernameExistsException') {
      throw error;
    }

    const result = await cognitoClient
      .adminGetUser({ UserPoolId: userPoolId, Username: email })
      .promise();

    attributes = result.UserAttributes;
  }

  if (!attributes) {
    throw new UserCreationFailedError('Failed to create a user account');
  }

  const id = getAttribute(attributes, 'sub');

  return id || email;
};

/**
 * Delete a user from the Cognito user pool
 * @param {string} email - The email address of the user to delete.
 */
export const deleteUser = async (email: string): Promise<void> => {
  try {
    await cognitoClient.adminDeleteUser({ UserPoolId: userPoolId, Username: email }).promise();
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error, 'Failed to delete user');
    }
  }
};

/**
 * FindUserByEmail is a function that takes an email address and returns the user's sub (subject)
 * attribute
 * @param {string} email - The email address of the user you want to find.
 * @param {Object} logger - the logger instance
 * @returns The user's sub attribute.
 */
export const findUserByEmail = async (
  email: string,
  { logger }: { logger: Logger },
): Promise<string | undefined> => {
  let user: AWS.CognitoIdentityServiceProvider.AdminGetUserResponse | undefined;
  try {
    user = await cognitoClient
      .adminGetUser({
        UserPoolId: userPoolId,
        Username: email,
      })
      .promise();
  } catch (error: unknown) {
    if ((error as Error).name !== 'UserNotFoundException') {
      logger.error(error as Error, 'Could not find user');
    }
  }

  if (!user?.UserAttributes) {
    return undefined;
  }

  return getAttribute(user.UserAttributes, 'sub');
};

/**
 * Disable a user
 * @param {string} email - The email address of the user to disable.
 */
export const disableUser = async (email: string): Promise<void> => {
  await cognitoClient.adminUserGlobalSignOut({ UserPoolId: userPoolId, Username: email }).promise();
  await cognitoClient
    .adminDisableUser({
      UserPoolId: userPoolId,
      Username: email,
    })
    .promise();
};

/**
 * Enable a user in the Cognito User Pool
 * @param {string} email - The email address of the user you want to enable.
 */
export const enableUser = async (email: string): Promise<void> => {
  await cognitoClient
    .adminEnableUser({
      UserPoolId: userPoolId,
      Username: email,
    })
    .promise();
};

type TokenErrorResponse = {
  error:
    | 'invalid_request'
    | 'invalid_client'
    | 'invalid_grant'
    | 'unauthorized_client'
    | 'unsupported_grant_type';
};

type TokenAuthCodeResponse =
  | {
      error: undefined;
      token_type: 'Bearer';
      access_token: string;
      refresh_token: string;
      id_token: string;
      expires_in: number;
    }
  | TokenErrorResponse;

type TokenRefreshResponse =
  | {
      error: undefined;
      token_type: 'Bearer';
      access_token: string;
      id_token: string;
      expires_in: number;
    }
  | TokenErrorResponse;

export interface CognitoIdentityToken {
  exp: number;
  sub: string;
  name: string;
  email: string;
  'custom:tenantId'?: string;
  'custom:tenantName'?: string;
}

export interface TokensWithRefresh {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenExp: number;
  idToken: string;
  decoded: CognitoIdentityToken;
}

export interface TokensWithOptionalRefresh {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  decoded: CognitoIdentityToken;
}

const headers = {
  'content-type': 'application/x-www-form-urlencoded',
  authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64')}`,
};

const tokenEndpoint = new URL('/oauth2/token/', AWS_COGNITO_DOMAIN).toString();

/**
 * It takes a code from the Cognito redirect, and exchanges it for tokens
 * @param {Context} ctx - Context
 * @param {string} code - The authorization code returned by the authorization code response.
 * @param {string} redirectUri - The redirect URI that was used in the authorization request.
 * @param {string} [baseUri] - The base URI of the redirect URI.
 * @returns The tokens are returned as a TokensWithRefresh object. This object contains the access
 * token, the refresh token, the expiration time of the access token, the expiration time of the
 * refresh token, and the decoded id token.
 */
export const exchangeCodeForTokens = async (
  ctx: Context,
  code: string,
  redirectUri: string,
  baseUri?: string,
): Promise<TokensWithRefresh> => {
  const body = querystring.stringify({
    grant_type: 'authorization_code',
    client_id: clientId,
    code,
    redirect_uri: new URL(redirectUri, baseUri ?? API_BASE).toString(),
  });

  ctx.logger.info(`Sending request to Cognito with params: ${body}`);

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers,
    body,
  });

  const token = (await response.json()) as TokenAuthCodeResponse;

  if (!token || token.error) {
    return Promise.reject(token);
  }

  const {
    access_token: accessToken,
    refresh_token: refreshToken,
    id_token: idToken,
    expires_in: expiresIn,
  } = token;

  const decoded = jwt.decode(idToken, { json: true }) as CognitoIdentityToken | null;

  if (!decoded) {
    // eslint-disable-next-line prefer-promise-reject-errors
    return Promise.reject('Could not verify tokens');
  }

  return {
    accessToken,
    refreshToken,
    tokenExp: decoded.exp,
    expiresIn,
    idToken,
    decoded,
  };
};

/**
 * TODO add ability to refresh session token
 * right now, session is limited by expiration of Cognito Refresh token
 */
export const refreshToken = async (refreshToken: string): Promise<TokensWithRefresh> => {
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers,
    body: querystring.stringify({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: refreshToken,
    }),
  });

  const token = (await response.json()) as TokenRefreshResponse;

  if (!token || token.error) {
    return Promise.reject(token);
  }

  const { access_token: accessToken, id_token: idToken, expires_in: expiresIn } = token;

  const decoded = jwt.decode(idToken, { json: true }) as CognitoIdentityToken | null;

  if (!decoded) {
    throw new Error('Could not verify tokens');
  }

  return {
    accessToken,
    refreshToken: accessToken,
    expiresIn,
    tokenExp: decoded.exp,
    idToken,
    decoded,
  };
};

/**
 * If the token is expired, refresh it
 * @param {TokensWithRefresh} tokens - TokensWithRefresh
 * @returns The tokens with the new refresh token.
 */
export const validateOrRefreshCognitoSession = async (
  tokens: TokensWithRefresh,
): Promise<TokensWithRefresh> => {
  const now = Math.floor(Date.now() / 1000);
  // TODO improve validation and refresh logic

  if (tokens.tokenExp > now) {
    return tokens;
  }

  return refreshToken(tokens.refreshToken);
};
