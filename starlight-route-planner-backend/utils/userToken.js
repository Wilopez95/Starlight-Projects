import { getUserTokenData } from '../services/tokens.js';

import { MOCKED_USER_TOKEN_DATA } from '../config.js';

export const extractToken = (ctx, stubbedToken) => {
  if (stubbedToken || !ctx.request.headers.authorization) {
    return stubbedToken;
  }
  const authorizationHeader = ctx.request.headers.authorization;

  const [, tokenId] = authorizationHeader.split(' ');

  return tokenId;
};

export const extractTokenData = async (ctx, tokenId, stubbedTokenData) => {
  if (stubbedTokenData || !tokenId) {
    return stubbedTokenData;
  }

  const tokenData = await getUserTokenData(ctx, tokenId);

  return tokenData;
};

export const setTokenData = (ctx, tokenData, tokenId) => {
  if (!tokenData) {
    return;
  }

  const { userInfo } = tokenData;
  const firstName = userInfo.firstName || '';
  const lastName = userInfo.lastName || '';

  ctx.state.user = {
    ...userInfo,
    name: userInfo.name || `${firstName} ${lastName}`,
    firstName,
    lastName,
    subscriberName: userInfo.tenantName,
    userAccessToken: tokenId,
    // TODO: yaaay, more aliases! Remove this eventually at some point.
    schemaName: userInfo.tenantName,
    userId: userInfo.id,
  };
  ctx.state.userTokenData = tokenData;
  ctx.state.userId = ctx.state.user.userId ?? 'system';
};

export const pickRequiredTokenData = ctx => {
  if (!ctx.state.userTokenData) {
    return {};
  }
  const {
    userInfo: {
      id,
      userId,
      customerId,
      contactId,
      email,
      firstName,
      lastName,
      subscriberName,
      schemaName,
      tenantId,
      tenantName,
    },
    umsAccessToken: accessToken,
  } = ctx.state.userTokenData;

  return {
    userInfo: {
      id,
      userId,
      customerId,
      contactId,
      email,
      firstName,
      lastName,
      subscriberName,
      schemaName,
      tenantId,
      tenantName,
    },
    accessToken,
  };
};

export const setTokenId = (ctx, tokenId) => {
  if (!tokenId) {
    return;
  }
  ctx.state.tokenId = tokenId;
};

export const proceedToken = async (ctx, { tokenId, existingTokenData, dontCheck = false }) => {
  let tokenData;

  if (dontCheck) {
    tokenData = existingTokenData;
    setTokenId(ctx, tokenId);
    setTokenData(ctx, tokenData, tokenId);
  } else if (tokenId) {
    tokenData = await extractTokenData(ctx, tokenId, MOCKED_USER_TOKEN_DATA);

    if (tokenData) {
      setTokenId(ctx, tokenId);
      setTokenData(ctx, tokenData, tokenId);
    }
  } else {
    tokenData = existingTokenData;
    setTokenData(ctx, tokenData, tokenId);
  }
};
