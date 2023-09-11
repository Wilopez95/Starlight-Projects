import httpStatus from 'http-status';

import { makeUmsGraphRequest } from '../../services/ums/common.js';

export const redirectUmsRequest = async (ctx) => {
  const { umsAccessToken } = ctx.state.userTokenData;
  const data = await makeUmsGraphRequest({
    ctx,
    token: umsAccessToken,
  });
  ctx.body = data;
  ctx.status = httpStatus.OK;
};
