import { createPrivateKey, createPublicKey, KeyObject } from 'crypto';
import { readFileSync } from 'fs';
import { V2 } from 'paseto';
import { isCI } from 'ci-info';
import {
  SERVICE_PUBLIC_KEY,
  SERVICE_SECRET_KEY,
  SERVICE_SECRET_KEY_PASSPHRASE,
} from '../config/config';
import { Context, IServiceToken, IUser, IUserTokenData } from '../Interfaces/Auth';
import { client as redis } from './redis';

let sk: KeyObject | undefined;
let pk: KeyObject | undefined;

if (!isCI) {
  if (!SERVICE_PUBLIC_KEY) {
    throw new Error('SERVICE_PUBLIC_KEY is required');
  }

  if (!SERVICE_SECRET_KEY) {
    throw new Error('SERVICE_SECRET_KEY is required');
  }

  let publicKeyContents = SERVICE_PUBLIC_KEY;
  let secretKeyContents = SERVICE_SECRET_KEY;

  if (SERVICE_PUBLIC_KEY.startsWith('/')) {
    publicKeyContents = readFileSync(SERVICE_PUBLIC_KEY).toString();
  }

  if (SERVICE_SECRET_KEY.startsWith('/')) {
    secretKeyContents = readFileSync(SERVICE_SECRET_KEY).toString();
  }

  pk = createPublicKey(publicKeyContents);
  sk = createPrivateKey({
    key: secretKeyContents,
    passphrase: SERVICE_SECRET_KEY_PASSPHRASE,
  });
}

export const createServiceToken = async (
  payload: IUser,
  { requestId, audience, subject }: IServiceToken,
) => {
  if (!sk) {
    throw new TypeError('Secret key not initialized!');
  }

  const signed = await V2.sign(payload, sk, {
    issuer: 'billing',
    audience,
    subject,
    jti: requestId,
    iat: true,
    // notBefore:  token is valid after this timestamp
    expiresIn: '15 min',
  });

  return signed;
};

export const parseServiceToken = async (
  token: string,
  { audience, subject, issuer }: IServiceToken = {},
) => {
  if (!pk) {
    throw new TypeError('Secret key not initialized!');
  }

  const parsed: IServiceToken = await V2.verify(token, pk, {
    audience,
    subject,
    issuer,
    clockTolerance: '1 min',
  });

  return parsed;
};

const getTokenKey = (tokenId: string) => `resource-user-token:access:${tokenId}`;

const getTokenData = async (ctx: Context, tokenKey: string) => {
  const dataStr = await redis.get(tokenKey);

  if (!dataStr) {
    return null;
  }

  try {
    return JSON.parse(dataStr);
  } catch (e: unknown) {
    ctx.logger.error(`Failed to parse token (${tokenKey}) data`, e);

    return null;
  }
};

export const getUserTokenData = (ctx: Context, token: string): Promise<IUserTokenData> =>
  getTokenData(ctx, getTokenKey(token));
