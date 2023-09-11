import { createPrivateKey, createPublicKey } from 'crypto';
import { readFileSync } from 'fs';
import { V2 } from 'paseto';
import {
  SERVICE_PUBLIC_KEY,
  SERVICE_SECRET_KEY,
  SERVICE_SECRET_KEY_PASSPHRASE,
} from '../config.js';
import asyncWrap from '../utils/asyncWrap.js';

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

const pk = createPublicKey(publicKeyContents);
const sk = createPrivateKey({
  key: secretKeyContents,
  passphrase: SERVICE_SECRET_KEY_PASSPHRASE,
});

// export interface TokenOptions {
//   /**
//    * for whom this token is, could be about srn
//    */
//   audience: string;

//   /**
//    * subject that will use this token, could be target service
//    * */
//   subject: string;
// }

// export interface CreateTokenOptions extends TokenOptions {
//   requestId: string;
// }

/**
 *
 * @param {object} payload token payload
 * @param {CreateTokenOptions} options V2.sign options
 *
 * @returns {Promise<string>} signed token
 */
export const createToken = (payload, { requestId, audience, subject }) =>
  V2.sign(payload, sk, {
    issuer: 'dispatch',
    audience,
    subject,
    jti: requestId,
    iat: true,
    // notBefore:  token is valid after this timestamp
    expiresIn: '5 min',
  });

// export interface ParseTokenOptions {
//   issuer?: string;
//   audience?: string;
//   subject?: string;
// }

// export interface ParsedToken {
//   iat: string;
//   exp: string;
//   aud: string;
//   iss: string;
//   sub: string;
// }

/**
 *
 * @param {string} token token to parse
 * @param {ParseTokenOptions} options for V2.verify
 *
 * @returns {Promise<ParsedToken>} parsed token
 */
export const parseToken = async (token, { audience, subject, issuer } = {}) => {
  const parsed = await V2.verify(token, pk, {
    audience,
    subject,
    issuer,
    clockTolerance: '1 min',
  });

  return parsed;
};

/**
 * middleware that populates context with serviceToken payload
 *
 * reads "authorization" header and checks for content that starts with ServiceToken
 *
 * @returns {Promise<void>} async
 */
export const withServiceTokenMiddleware = () =>
  asyncWrap(async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return next();
    }

    const [tokenHeader, token] = authorizationHeader.split(' ');

    if (tokenHeader.toLowerCase() !== 'servicetoken') {
      return next();
    }

    try {
      req.serviceToken = await parseToken(token);
      const payload = req.serviceToken;
      if (payload) {
        const { tenantName, schemaName } = payload;
        req.user = {
          ...payload,
          tenantName: tenantName || schemaName,
        };
      }
    } catch (e) {
      req.logger.error(e);
    }

    return next();
  });
