import { extractToken, proceedToken } from '../utils/userToken.js';

import { MOCKED_USER_TOKEN_ID } from '../config.js';

export const userToken = async (ctx, next) => {
  const tokenId = extractToken(ctx, MOCKED_USER_TOKEN_ID);

  await proceedToken(ctx, { tokenId });

  await next();
};
