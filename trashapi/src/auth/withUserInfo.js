import asyncWrap from '../utils/asyncWrap.js';
import { getUserTokenData } from './tokens.js';
import { setUserData } from './utils.js';

export const userMiddleware = () =>
  asyncWrap(async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || req.userInfo) {
      return next();
    }

    const [, tokenId] = authorizationHeader.split(' ');
    if (!tokenId) {
      return next();
    }

    const tokenData = await getUserTokenData(tokenId);

    if (!tokenData) {
      return next();
    }

    req.userTokenData = tokenData;
    await setUserData(req, tokenData.userInfo);

    return next();
  });
