import R from 'ramda';
import getToken from '../getToken.js';
import { createToken } from '../../auth/serviceToken.js';

const getHeaders = async ({ req, data }) => {
  const { headers: dataHeaders = {}, token, serviceToken, audience } = data;
  const { reqId, user = {} } = req;

  const headers = {
    accept: 'application/json',
    'x-amzn-trace-id': reqId,
    'content-type': 'application/json',
    ...dataHeaders,
  };

  if (headers.authorization || headers.Authorization) {
    return headers;
  }

  const userId = user.id ?? user.userId;
  const tenantName = user.tenantName ?? user.schemaName;
  let accessToken = token ?? getToken(req);

  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  } else {
    const payload = {
      ...R.omit(['permissions'], user),
      id: userId,
      userId,
      tenantName,
      schemaName: tenantName,
      subscriberName: tenantName,
    };
    accessToken =
      serviceToken ??
      (await createToken(payload, {
        audience,
        subject: userId ? String(userId) : 'unknown',
        requestId: reqId,
      }));
    headers.authorization = `ServiceToken ${accessToken}`;
  }

  return headers;
};

export default getHeaders;
