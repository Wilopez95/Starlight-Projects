import { getUserTokenData } from './tokens.js';

export const userMiddleware = () => async (ctx, next) => {
  const authorizationHeader = ctx.request.headers.authorization;
  if (!authorizationHeader || ctx.userInfo) {
    return next();
  }

  const [, tokenId] = authorizationHeader.split(' ');
  if (!tokenId) {
    return next();
  }

  const tokenData = await getUserTokenData(ctx, tokenId);

  if (!tokenData) {
    return next();
  }

  const { userInfo } = tokenData;
  const firstName = userInfo.firstName || '';
  const lastName = userInfo.lastName || '';

  ctx.state.user = {
    ...userInfo,
    name: userInfo.name || `${firstName} ${lastName}`,
    firstName,
    lastName,
    userId: userInfo.id,
  };
  ctx.state.userTokenData = tokenData;

  await next();
};
