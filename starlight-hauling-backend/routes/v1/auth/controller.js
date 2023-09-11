import { getUserByEmail } from '../../../services/ums.js';
import { createServiceToken, saveAccessTokenToRedis } from '../../../services/tokens.js';

import ApiError from '../../../errors/ApiError.js';

export const LOBBY_RESOURCE = 'srn:global:global:lobby';
export const ADMIN_RESOURCE = 'srn:global:global:admin';

export const getAccessToken = async ctx => {
  const { email, isAdmin, businessUnitId = null, tenantName = null } = ctx.request.validated.body;
  if (!email) {
    throw ApiError.invalidRequest('You must specify an email to login');
  }

  const serviceToken = await createServiceToken(
    {},
    {
      audience: 'ums',
      requestId: ctx.reqId,
    },
  );

  let resource;

  if (isAdmin && !tenantName && !businessUnitId) {
    resource = ADMIN_RESOURCE;
  } else if (!tenantName && !businessUnitId) {
    resource = LOBBY_RESOURCE;
  } else if (tenantName && !businessUnitId) {
    resource = `srn:${tenantName}:global:global`;
  } else if (!tenantName && businessUnitId) {
    throw ApiError.invalidRequest('If business unit is provided, tenant name is required');
  } else {
    resource = `srn:${tenantName}:hauling:${businessUnitId}`;
  }

  const userInfo = await getUserByEmail(ctx, { serviceToken, email, resource });

  const user = userInfo?.data?.user;
  if (!user) {
    throw ApiError.notFound(`User with email ${email} does not exist`);
  }

  user.permissions = user.availableActions;

  if (!user) {
    throw ApiError.notFound('Such user cannot be found in UMS');
  }

  user.resource = resource;

  const res = await saveAccessTokenToRedis(user);

  ctx.sendObj(res);
};
