import { createPrivateKey, createPublicKey } from 'crypto';
import { readFileSync } from 'fs';
import { V2 } from 'paseto';
import { isCI } from 'ci-info';

import {
  SERVICE_PUBLIC_KEY,
  SERVICE_SECRET_KEY,
  SERVICE_SECRET_KEY_PASSPHRASE,
} from '../config.js';
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

  pk = createPublicKey(publicKeyContents);
  sk = createPrivateKey({
    key: secretKeyContents,
    passphrase: SERVICE_SECRET_KEY_PASSPHRASE,
  });
}

export const createServiceToken = async (payload, { requestId, audience, subject }) => {
  if (!sk) {
    throw new TypeError('Secret key not initialized!');
  }

  const signed = await V2.sign(payload, sk, {
    issuer: 'operations',
    audience,
    subject,
    jti: requestId,
    iat: true,
    // notBefore:  token is valid after this timestamp
    expiresIn: '15 min',
  });

  return signed;
};

export const parseServiceToken = async (token, { audience, subject, issuer } = {}) => {
  if (!pk) {
    throw new TypeError('Secret key not initialized!');
  }

  const parsed = await V2.verify(token, pk, {
    audience,
    subject,
    issuer,
    clockTolerance: '1 min',
  });

  return parsed;
};

const getTokenKey = tokenId => `resource-user-token:access:${tokenId}`;

const getTokenData = async (ctx, tokenKey) => {
  const dataStr = await redis.get(tokenKey);
  if (!dataStr) {
    return null;
  }

  try {
    return JSON.parse(dataStr);
  } catch (e) {
    ctx.logger.error(`Failed to parse token (${tokenKey}) data`, e);

    return null;
  }
};

export const getUserTokenData = (ctx, token) => getTokenData(ctx, getTokenKey(token));
