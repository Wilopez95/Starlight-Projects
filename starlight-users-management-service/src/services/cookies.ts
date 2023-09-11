import { Context } from '../context';
import { SESSION_COOKIE, TOKEN_COOKIE, USER_IDENTITY_SESSION_MAX_AGE, NODE_ENV } from '../config';

/**
 * Set the session cookie to the given token
 * @param {Context} ctx - Context
 * @param {string} token - The token to set as the cookie value.
 */
export const setSessionCookie = (ctx: Context, token: string): void => {
  ctx.cookies.set(SESSION_COOKIE, token, {
    maxAge: USER_IDENTITY_SESSION_MAX_AGE,
    secure: NODE_ENV !== 'development',
    httpOnly: true,
    // sameSite: 'lax',
  });
};

/**
 * Clear the session cookie
 * @param {Context} ctx - Context
 */
export const clearSessionCookie = (ctx: Context): void => {
  setSessionCookie(ctx, '');
};

/**
 * Get the session cookie from the request context
 * @param {Context} ctx - Context
 */
export const getSessionCookie = (ctx: Context): string | undefined =>
  ctx.cookies.get(SESSION_COOKIE);

/**
 * `getResourceTokenCookie` returns the value of the `TOKEN_COOKIE` cookie if it exists, otherwise it
 * returns undefined
 * @param {Context} ctx - Context
 */
export const getResourceTokenCookie = (ctx: Context): string | undefined =>
  ctx.cookies.get(TOKEN_COOKIE);
