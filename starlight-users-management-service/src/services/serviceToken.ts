import { createPrivateKey, createPublicKey, KeyObject } from 'crypto';
import { readFileSync } from 'fs';
import { V2 } from 'paseto';
import { isCI } from 'ci-info';

import { SERVICE_PUBLIC_KEY, SERVICE_SECRET_KEY, SERVICE_SECRET_KEY_PASSPHRASE } from '../config';

let sk: KeyObject | undefined;
let pk: KeyObject | undefined;

if (!isCI) {
  if (!SERVICE_PUBLIC_KEY) {
    throw new Error('SERVICE_PUBLIC_KEY is required');
  }

  if (!SERVICE_SECRET_KEY) {
    throw new Error('SERVICE_SECRET_KEY is required');
  }

  let publicKeyContents: string | Buffer = SERVICE_PUBLIC_KEY;
  let secretKeyContents: string | Buffer = SERVICE_SECRET_KEY;

  if (SERVICE_PUBLIC_KEY.startsWith('/')) {
    publicKeyContents = readFileSync(SERVICE_PUBLIC_KEY);
  }

  if (SERVICE_SECRET_KEY.startsWith('/')) {
    secretKeyContents = readFileSync(SERVICE_SECRET_KEY);
  }

  pk = createPublicKey(publicKeyContents);
  sk = createPrivateKey({
    key: secretKeyContents,
    passphrase: SERVICE_SECRET_KEY_PASSPHRASE,
  });
}

export interface TokenOptions {
  /**
   * for whom this token is, who will be using this token. could be target service
   */
  audience: string;

  /**
   * who is this token about, could be about srn
   * */
  subject: string;
}

export interface CreateTokenOptions extends TokenOptions {
  requestId: string;
}

/**
 * CreateToken() creates a JWT token
 * @param payload - The payload to be signed.
 * @param {CreateTokenOptions}  - requestId - The guid of the request.
 * @param {CreateTokenOptions} - audience - The audience of the token.
 * @param {CreateTokenOptions} - subject - The subject of the token.
 * @returns A token.
 */
export const createToken = (
  payload: Record<string, unknown>,
  { requestId, audience, subject }: CreateTokenOptions,
): Promise<string> => {
  if (!sk) {
    throw new Error('Secret key not initialized!');
  }

  return V2.sign(payload, sk, {
    issuer: 'ums',
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
  kid: string;
  [key: string]: unknown;
}

/**
 * Given a token, parse it and verify it
 * @param {string} token - The token to verify.
 * @param {ParseTokenOptions}  - `audience` is the audience that the token is intended for.
 * `subject` is the subject of the token. issuer` is the issuer of the token.
 * @returns The parsed token.
 */
export const parseToken = async <T extends ParsedToken>(
  token: string,
  { audience, subject, issuer }: ParseTokenOptions = {},
): Promise<T> => {
  if (!pk) {
    throw new Error('Public key not initialized!');
  }

  const parsed = await V2.verify(token, pk, {
    audience,
    subject,
    issuer,
    clockTolerance: '1 min',
  });

  return parsed as T;
};
