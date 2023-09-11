import { Next } from 'koa';
import { Context } from '../Interfaces/Auth';
import { extractToken, proceedToken } from '../utils/userToken';

export const userToken = async (ctx: Context, next: Next) => {
  const tokenId: string = extractToken(ctx);

  await proceedToken(ctx, { tokenId });

  await next();
};
