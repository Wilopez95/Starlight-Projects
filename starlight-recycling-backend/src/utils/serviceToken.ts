import { createPrivateKey, createPublicKey } from 'crypto';
import { Next } from 'koa';
import { readFileSync } from 'fs';
import { V2 } from 'paseto';
import { Middleware } from 'koa-compose';
import {
  // API_URL,
  SERVICE_PUBLIC_KEY,
  SERVICE_SECRET_KEY,
  SERVICE_SECRET_KEY_PASSPHRASE,
} from '../config';
import { Context } from '../types/Context';
import Me from 'src/types/Me';

if (!SERVICE_PUBLIC_KEY) {
  throw new Error('SERVICE_PUBLIC_KEY is required');
}

if (!SERVICE_SECRET_KEY) {
  throw new Error('SERVICE_SECRET_KEY is required');
}

let publicKeyContents: string | Buffer = SERVICE_PUBLIC_KEY;
let secretKeyContents: string | Buffer = SERVICE_SECRET_KEY;

if (SERVICE_PUBLIC_KEY[0] === '/') {
  publicKeyContents = readFileSync(SERVICE_PUBLIC_KEY);
}

if (SERVICE_SECRET_KEY[0] === '/') {
  secretKeyContents = readFileSync(SERVICE_SECRET_KEY);
}

const pk = createPublicKey(publicKeyContents);
const sk = createPrivateKey({
  key: secretKeyContents,
  passphrase: SERVICE_SECRET_KEY_PASSPHRASE,
});

export interface TokenOptions {
  /**
   * for whom this token is, who will be using this token. could be target service
   */
  audience: string;

  /**
   * who is this token about, could be about srn
   */
  subject?: string;
}

export interface CreateTokenOptions extends TokenOptions {
  requestId: string;
}

export const createToken = (
  payload: Record<string, unknown>,
  { requestId, audience, subject }: CreateTokenOptions,
): Promise<string> => {
  return V2.sign(payload, sk, {
    issuer: 'recycling',
    audience,
    subject,
    jti: requestId,
    iat: true,
    // notBefore:  token is valid after this timestamp
    expiresIn: '5 min',
  });
};

export interface ParseTokenOptions {
  issuer?: string;
  audience?: string;
  subject?: string;
}

export interface ParsedToken {
  iat: string;
  exp: string;
  aud: string;
  iss: string;
  sub: string;
  jti: string;
}

export const parseToken = async <T extends ParsedToken>(
  token: string,
  { audience, subject, issuer }: ParseTokenOptions = {},
): Promise<T> => {
  const parsed = await V2.verify(token, pk, {
    audience,
    subject,
    issuer,
    clockTolerance: '1 min',
  });

  return parsed as T;
};

export const withServiceTokenMiddleware = (): Middleware<Context> => async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const authorizationHeader = ctx.request.headers['authorization'] as string | undefined;

  // eslint-disable-next-line
  // @ts-ignore?
  if (!authorizationHeader) {
    await next();

    return;
  }

  const [tokenHeader, token] = authorizationHeader.split(' ');

  if (tokenHeader.toLowerCase() !== 'servicetoken') {
    await next();

    return;
  }

  try {
    const tokenData = await parseToken<{ resource?: string; userInfo?: Me } & ParsedToken>(token, {
      // TODO return API_URL once tested
      // audience: API_URL,
      audience: 'recycling',
    });

    ctx.serviceToken = tokenData;

    // TODO fix types
    if (tokenData) {
      if (tokenData.userInfo) {
        ctx.userInfo = tokenData.userInfo;
      } else if (tokenData.resource) {
        ctx.userInfo = {
          email: null,
          firstName: null,
          lastName: null,
          id: `service-token:${tokenData.iss}:${tokenData.sub}`,
          permissions: [],
          resource: tokenData.resource,
          tenantId: 0,
        };
      }
    }
  } catch (e) {
    ctx.logger.error(e);
  }

  await next();
};
