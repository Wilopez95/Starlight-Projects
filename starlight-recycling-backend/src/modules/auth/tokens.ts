import { v4 } from 'uuid';
import { client as redis } from '../../services/redis';
import { Context } from '../../types/Context';
import { AMQP_LOGOUT_EXCHANGE, AMQP_QUEUE_LOGOUT } from '../../config';
import { observeOn } from '../../services/queue';
import logger from '../../services/logger';

export interface ResourceUserToken {
  accessToken: string;
  accessTokenExp: number;
  refreshToken: string;
  refreshTokenExp: number;
}

export interface ResourceMeUserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  resource: string;
  permissions: string[];
  tenantId: number;
}

export interface AccessTokenData {
  umsAccessToken: ResourceUserToken['accessToken'];
  umsAccessTokenExp: ResourceUserToken['accessTokenExp'];
  userInfo: ResourceMeUserInfo;
  refreshTokenId: string;
}

export interface RefreshTokenData {
  accessTokenId: string;
  umsRefreshToken: ResourceUserToken['refreshToken'];
  umsRefreshTokenExp: ResourceUserToken['refreshTokenExp'];
}

const getTokenKey = (tokenId: string) => `resource-user-token-recycling:access:${tokenId}`;
const getRefreshTokenKey = (tokenId: string) => `resource-user-token-recycling:refresh:${tokenId}`;
const getUserLoginKey = (userId: string) => `recycling-user-login:${userId}`;
const getHaulingTokenKey = (tokenId: string) => `resource-user-token:access:${tokenId}`;
const getHaulingRefreshTokenKey = (tokenId: string) => `resource-user-token:refresh:${tokenId}`;

export interface UserTokens {
  token: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
}

const getTokenData = async <T>(tokenKey: string, ctx?: Context): Promise<T | null> => {
  const dataStr = await redis.get(tokenKey);

  if (!dataStr) {
    return null;
  }

  try {
    return JSON.parse(dataStr);
  } catch (e) {
    const log = ctx?.logger || logger;
    log.error(`Failed to parse token (${tokenKey}) data`, e);

    return null;
  }
};

export const getUserTokenData = async (
  token: string,
  ctx?: Context,
): Promise<AccessTokenData | null> => {
  let tokenData: AccessTokenData | null = await getTokenData(getTokenKey(token), ctx);

  if (!tokenData) {
    tokenData = await getTokenData(getHaulingTokenKey(token), ctx);
  }

  return tokenData;
};

export const getUserRefreshTokenData = async (
  token: string,
  ctx?: Context,
): Promise<RefreshTokenData | null> => {
  let tokenData: RefreshTokenData | null = await getTokenData(getRefreshTokenKey(token), ctx);

  if (!tokenData) {
    tokenData = await getTokenData(getHaulingRefreshTokenKey(token), ctx);
  }

  return tokenData;
};

export const deleteTokensByAccessToken = async (token: string, ctx?: Context): Promise<void> => {
  const tokenData = await getUserTokenData(token, ctx);

  if (tokenData?.refreshTokenId) {
    await redis.del(getRefreshTokenKey(tokenData?.refreshTokenId));
  }

  await redis.del(getTokenKey(token));
};

export const deleteTokensByRefreshToken = async (token: string, ctx?: Context): Promise<void> => {
  const tokenData = await getUserRefreshTokenData(token, ctx);

  if (tokenData?.accessTokenId) {
    await redis.del(getTokenKey(tokenData?.accessTokenId));
  }

  await redis.del(getRefreshTokenKey(token));
};

export const createUserTokens = async (
  umsTokens: ResourceUserToken,
  me: ResourceMeUserInfo,
): Promise<UserTokens> => {
  const now = Math.floor(Date.now() / 1000);
  const tokenId = v4();
  const refreshTokenId = v4();

  const data: AccessTokenData = {
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

  await redis.set(
    getTokenKey(tokenId),
    JSON.stringify(data),
    'ex',
    (umsTokens.accessTokenExp as number) - now,
  );
  await redis.set(
    getRefreshTokenKey(refreshTokenId),
    JSON.stringify(refreshData),
    'ex',
    (umsTokens.refreshTokenExp as number) - now,
  );

  await redis.sadd(getUserLoginKey(me.id), tokenId);

  return {
    token: tokenId,
    expiresIn: umsTokens.accessTokenExp - now,
    refreshToken: refreshTokenId,
    refreshExpiresIn: umsTokens.refreshTokenExp - now,
  };
};

interface LogoutEvent {
  userId: string;
}

export const logoutExchangeObservable = observeOn<LogoutEvent>({
  type: AMQP_QUEUE_LOGOUT,
  bindings: [
    { exchange: AMQP_LOGOUT_EXCHANGE, routingKey: '', type: 'fanout', options: { durable: true } },
  ],
});

logoutExchangeObservable.subscribe(async ({ payload }) => {
  const { userId } = payload;
  const tokens = await redis.smembers(getUserLoginKey(userId));

  if (tokens.length === 0) {
    logger.info(`Tokens not found for user ${userId}`);

    return;
  }

  await Promise.all(
    tokens.flatMap((token) => [
      deleteTokensByAccessToken(token),
      redis.srem(getUserLoginKey(userId), token),
    ]) as Array<Promise<void | number>>,
  );

  logger.info(`User ${userId} successfully logged out`);
});
