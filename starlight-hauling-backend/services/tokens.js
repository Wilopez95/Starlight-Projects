import { readFileSync } from 'fs';
import * as crypto from 'crypto';

import { nanoid } from 'nanoid';
import jsonwebtoken from 'jsonwebtoken';
import { V2 } from 'paseto';
import bcrypt from 'bcrypt';

import { isCI } from 'ci-info';

import {
  SECRET,
  PASSWORD_HASHING_ROUNDS,
  SERVICE_PUBLIC_KEY,
  SERVICE_SECRET_KEY,
  SERVICE_SECRET_KEY_PASSPHRASE,
} from '../config.js';

import { logger } from '../utils/logger.js';
import { client as redis } from './redis.js';

let sk;
let pk;

if (!isCI) {
  if (!SERVICE_PUBLIC_KEY) {
    throw new Error('SERVICE_PUBLIC_KEY is required');
  }

  if (!SERVICE_SECRET_KEY) {
    throw new Error('SERVICE_SECRET_KEY is required');
  }

  let publicKeyContents = SERVICE_PUBLIC_KEY;
  let secretKeyContents = SERVICE_SECRET_KEY;

  if (SERVICE_PUBLIC_KEY[0] === '/') {
    publicKeyContents = readFileSync(SERVICE_PUBLIC_KEY);
  }

  if (SERVICE_SECRET_KEY[0] === '/') {
    secretKeyContents = readFileSync(SERVICE_SECRET_KEY);
  }

  pk = crypto.createPublicKey(publicKeyContents);
  sk = crypto.createPrivateKey({
    key: secretKeyContents,
    passphrase: SERVICE_SECRET_KEY_PASSPHRASE,
  });
}

export const getTokenKey = tokenId => `resource-user-token:access:${tokenId}`;
const getRefreshTokenKey = tokenId => `resource-user-token:refresh:${tokenId}`;

export const getTokenData = async (ctx, tokenKey) => {
  const dataStr = await redis.get(tokenKey);

  if (!dataStr) {
    return null;
  }

  try {
    return JSON.parse(dataStr);
  } catch (e) {
    const log = ctx ? ctx.logger : logger;
    log.error(`Failed to parse token (${tokenKey}) data`, e);

    return null;
  }
};

export const getUserTokenData = (ctx, token) => getTokenData(ctx, getTokenKey(token));

export const getUserRefreshTokenData = (ctx, token) => getTokenData(ctx, getRefreshTokenKey(token));

export const deleteTokensByAccessToken = async (ctx, token) => {
  const tokenData = await getUserTokenData(ctx, token);

  if (tokenData?.refreshTokenId) {
    await redis.del(getRefreshTokenKey(tokenData?.refreshTokenId));
  }

  await redis.del(getTokenKey(token));
};

export const deleteTokensByRefreshToken = async (ctx, token) => {
  const tokenData = await getUserRefreshTokenData(ctx, token);

  if (tokenData?.accessTokenId) {
    await redis.del(getTokenKey(tokenData?.accessTokenId));
  }

  await redis.del(getRefreshTokenKey(token));
};

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

const getRandomBytes = b => crypto.randomBytes(b).toString('hex');

export const generateAccessToken = (payload, expiresIn) =>
  jsonwebtoken.sign(payload, SECRET, Object.assign(payload.exp ? {} : { expiresIn }));

export const validateToken = token =>
  new Promise((resolve, reject) => {
    jsonwebtoken.verify(token, SECRET, (error, tokenData) => {
      if (error) {
        return reject(error);
      }
      return resolve(tokenData);
    });
  });

export const createServiceToken = (payload, { requestId, audience, subject }) =>
  V2.sign(payload, sk, {
    issuer: 'core',
    audience,
    subject,
    jti: requestId,
    iat: true,
    // notBefore:  token is valid after this timestamp
    expiresIn: '15 min',
  });

export const parseServiceToken = async (token, { audience, subject, issuer } = {}) => {
  const parsed = await V2.verify(token, pk, {
    audience,
    subject,
    issuer,
    clockTolerance: '1 min',
  });

  return parsed;
};

export const hashPassword = async password => {
  const hash = await bcrypt.hash(password, PASSWORD_HASHING_ROUNDS);
  return hash;
};

export const compareHashes = async (password, hash) => {
  const result = await bcrypt.compare(password, hash);
  return result;
};

export const getRandomPassword = (length = 30) => getRandomBytes(length);

export const saveAccessTokenToRedis = async userInfo => {
  const now = Math.floor(Date.now() / 1000);
  const tokenId = nanoid();
  const refreshTokenId = nanoid();
  const oneDayInMs = 86400000;

  const data = {
    umsAccessToken: 'umsAccessToken',
    umsAccessTokenExp: now + oneDayInMs,
    userInfo,
    refreshTokenId,
  };

  await redis.set(getTokenKey(tokenId), JSON.stringify(data), 'ex', oneDayInMs);

  return {
    token: tokenId,
    expiresIn: oneDayInMs,
  };
};
