import { nanoid } from 'nanoid';
import { client as redis } from '../services/redis/index.js';
import logger from '../services/logger/index.js';

// export interface ResourceUserToken {
//   accessToken: string;
//   accessTokenExp: number;
//   refreshToken: string;
//   refreshTokenExp: number;
// }

// export interface ResourceMeUserInfo {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   resource: string;
//   permissions: string[];
// }

// export interface AccessTokenData {
//   umsAccessToken: ResourceUserToken['accessToken'];
//   umsAccessTokenExp: ResourceUserToken['accessTokenExp'];
//   userInfo: ResourceMeUserInfo;
//   refreshTokenId: string;
// }

// export interface RefreshTokenData {
//   accessTokenId: string;
//   umsRefreshToken: ResourceUserToken['refreshToken'];
//   umsRefreshTokenExp: ResourceUserToken['refreshTokenExp'];
// }

// export interface UserTokens {
//   token: string;
//   expiresIn: number;
//   refreshToken: string;
//   refreshExpiresIn: number;
// }

const getTokenKey = tokenId => `resource-user-token:access:${tokenId}`;
const getRefreshTokenKey = tokenId => `resource-user-token:refresh:${tokenId}`;

/**
 *
 * @param {string} tokenKey a redis key
 *
 * @return {Promise<T | null>} returns data or null if no data found or failed to parse value
 */
const getTokenData = async tokenKey => {
  const dataStr = await redis.get(tokenKey);

  if (!dataStr) {
    return null;
  }

  try {
    return JSON.parse(dataStr);
  } catch (e) {
    logger.error(`Failed to parse token (${tokenKey}) data`, e);

    return null;
  }
};

/**
 *
 * @param {string} token user access token
 *
 * @return {Promise<AccessTokenData | null>} returns AccessTokenData or null if no data found
 */
export const getUserTokenData = token => getTokenData(getTokenKey(token));

/**
 *
 * @param {*} token user refresh token
 *
 * @return {Promise<RefreshTokenData | null>} returns RefreshTokenData or null if no data found
 */
export const getUserRefreshTokenData = token => getTokenData(getRefreshTokenKey(token));

/**
 *
 * @param {string} token user access token
 *
 * @return {Promise<void>} void
 */
export const deleteTokensByAccessToken = async token => {
  const tokenData = await getUserTokenData(token);

  if (tokenData?.refreshTokenId) {
    await redis.del(getRefreshTokenKey(tokenData?.refreshTokenId));
  }

  await redis.del(getTokenKey(token));
};

/**
 *
 * @param {string} token user refresh token
 *
 * @return {Promise<void>} void
 */
export const deleteTokensByRefreshToken = async token => {
  const tokenData = await getUserRefreshTokenData(token);

  if (tokenData?.accessTokenId) {
    await redis.del(getTokenKey(tokenData?.accessTokenId));
  }

  await redis.del(getRefreshTokenKey(token));
};

/**
 *
 * @param {ResourceUserToken} umsTokens tokens from UMS
 * @param {ResourceMeUserInfo} me repsonse from "me" using UMS access token
 *
 * @return {Promise<UserTokens>} return user access and refresh tokens
 */
export const createUserTokens = async (umsTokens, me) => {
  const now = Math.floor(Date.now() / 1000);
  const tokenId = nanoid();
  const refreshTokenId = nanoid();

  const data = {
    umsAccessToken: umsTokens.accessToken,
    umsAccessTokenExp: umsTokens.accessTokenExp,
    userInfo: me,
    refreshTokenId,
  };
  const refreshData = {
    tokenId,
    umsRefreshToken: umsTokens.refreshToken,
    umsRefreshTokenExp: umsTokens.refreshTokenExp,
  };

  await redis.set(getTokenKey(tokenId), JSON.stringify(data), 'ex', umsTokens.accessTokenExp - now);
  await redis.set(
    getRefreshTokenKey(refreshTokenId),
    JSON.stringify(refreshData),
    'ex',
    umsTokens.refreshTokenExp - now,
  );

  return {
    token: tokenId,
    expiresIn: umsTokens.accessTokenExp - now,
    refreshToken: refreshTokenId,
    refreshExpiresIn: umsTokens.refreshTokenExp - now,
  };
};
