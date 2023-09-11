import { getToken } from '../token.js';

const getHeaders = ({ ctx, data }) => {
  const { headers: dataHeaders = {}, token } = data;

  const headers = {
    'accept': 'application/json',
    'x-amzn-trace-id': ctx?.reqId,
    'content-type': 'application/json',
    ...dataHeaders,
  };

  const accessToken = token ?? getToken(ctx);
  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }

  return headers;
};

export default getHeaders;
