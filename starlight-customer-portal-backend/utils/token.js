import { createSecretKey } from 'crypto';
import paseto from 'paseto';

import { FRONTEND_URL, TOKEN_SECRET, TOKEN_COOKIE } from '../config.js';

const key = createSecretKey(Buffer.from(TOKEN_SECRET, 'base64'));

export const getToken = (ctx) => {
  const cookieToken = ctx.cookies.get(TOKEN_COOKIE);

  if (cookieToken) {
    return cookieToken;
  }

  let authHeaderToken = ctx.headers.authorization;

  if (authHeaderToken?.startsWith('Bearer ')) {
    authHeaderToken = authHeaderToken.slice(7);
  }

  return authHeaderToken;
};

export const decryptToken = async (token) => {
  const decrypted = await paseto.V2.decrypt(token, key, {
    audience: FRONTEND_URL,
    issuer: FRONTEND_URL,
  });

  const { sub: id, name, email } = decrypted;

  return { id, name, email };
};
