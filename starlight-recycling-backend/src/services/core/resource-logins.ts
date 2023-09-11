import axios from 'axios';

import { createToken } from '../../utils/serviceToken';
import { API_URL, CORE_SERVICE_API_URL, TRACING_HEADER } from '../../config';
import { Context } from '../../types/Context';
import { AvailableResourceLogin } from './types/AvailableResourceLogins';
import { parseFacilitySrn } from '../../utils/srn';
export { AvailableResourceLogin } from './types/AvailableResourceLogins';

export const getAvailableResourceLogins = async (
  ctx: Context,
): Promise<AvailableResourceLogin[]> => {
  if (!ctx.userInfo.resource) {
    throw new Error('Failed to get resource from context');
  }

  const { tenantName } = parseFacilitySrn(ctx.userInfo.resource);

  if (!ctx.tokenData?.umsAccessToken) {
    return [];
  }

  const token = await createToken(
    {
      umsAccessToken: ctx.tokenData?.umsAccessToken,
      schemaName: tenantName,
      tenantName,
    },
    {
      audience: 'core',
      subject: ctx.userInfo.id || API_URL,
      requestId: ctx.reqId,
    },
  );

  const response = await axios.get(`${CORE_SERVICE_API_URL}/lobby/available-resource-logins`, {
    headers: {
      Authorization: `ServiceToken ${token}`,
      [TRACING_HEADER]: ctx.reqId,
    },
  });

  return response.data;
};
