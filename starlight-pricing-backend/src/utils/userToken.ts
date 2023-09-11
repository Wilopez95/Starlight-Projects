import { Context, IProceedToken, IUserTokenData } from '../Interfaces/Auth';
import { getUserTokenData } from '../services/tokens';

export const extractToken = (ctx: Context) => {
  const authorizationHeader = ctx.request.headers.authorization;
  if (authorizationHeader) {
    const [, tokenId] = authorizationHeader.split(' ');

    return tokenId;
  }
  return '';
};

export const extractTokenData = async (
  ctx: Context,
  tokenId: string,
): Promise<IUserTokenData | undefined> => {
  const tokenData: IUserTokenData | undefined = await getUserTokenData(ctx, tokenId);

  return tokenData;
};

export const setTokenData = (ctx: Context, tokenData: IUserTokenData | undefined) => {
  if (!tokenData?.userInfo) {
    return;
  }
  const { userInfo } = tokenData;
  const firstName = userInfo.firstName ?? '';
  const lastName = userInfo.lastName ?? '';

  ctx.state.user = {
    ...userInfo,
    name: (userInfo.name ?? `${firstName} ${lastName}`.trim()) || 'Root',
    firstName,
    lastName,
    subscriberName: userInfo.tenantName,
    // TODO: yaaay, more aliases! Remove this eventually at some point.
    schemaName: userInfo.tenantName,
    userId: userInfo.id,
    tenantId: Number(userInfo.tenantId),
  };
  ctx.state.userTokenData = tokenData;
  ctx.state.userId = ctx.state.user.userId ?? 'system';
  // because there are a lot of places where manually constructed cut ctx uses short format TODO: refactor
  ctx.user = ctx.state.user;
  // because there are a lot of places where manually constructed cut ctx uses short format TODO: refactor
  ctx.models = ctx.state.models;
};

export const pickRequiredTokenData = (ctx: Context) => {
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

export const setTokenId = (ctx: Context, tokenId: string) => {
  if (!tokenId) {
    return;
  }
  ctx.state.tokenId = tokenId;
};

export const proceedToken = async (
  ctx: Context,
  { tokenId, existingTokenData, dontCheck = false }: IProceedToken,
) => {
  let tokenData: IUserTokenData | undefined;
  if (!dontCheck) {
    if (!tokenId) {
      return;
    }

    tokenData = await extractTokenData(ctx, tokenId);

    if (!tokenData) {
      return;
    }
  } else {
    tokenData = existingTokenData;
  }

  setTokenId(ctx, tokenId);
  setTokenData(ctx, tokenData);
};
