import { NODE_ENV, TOKEN_COOKIE } from '../config.js';

export const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV !== 'local',
  sameSite: NODE_ENV === 'local' ? 'strict' : 'none',
  path: '/',
};

export const getToken = ctx => ctx.cookies.get(TOKEN_COOKIE);

export const storeToken = (ctx, token) => ctx.cookies.set(TOKEN_COOKIE, token, cookieOptions);

export const clear = ctx => ctx.cookies.set(TOKEN_COOKIE);
