import httpStatus from 'http-status';

import { apiClient } from '../../../client.js';
import fixtures from '../../../fixtures.js';

describe('CSR Auth API Flow', () => {
  it('should return Unauthorized Error for invalid token', async () => {
    const { statusCode } = await apiClient
      .get(`invoices?customerIds=1&sortOrder=desc&sortBy=createdAt`)
      .set('authorization', `${fixtures.csrAccessToken}d`);
    expect(statusCode).toEqual(httpStatus.FORBIDDEN);
  });
  it('should return Unauthorized Error for expired token', async () => {
    const { statusCode } = await apiClient
      .get(`invoices?customerIds=1&sortOrder=desc&sortBy=createdAt`)
      .set('authorization', fixtures.csrAccessTokenExpired);
    expect(statusCode).toEqual(httpStatus.FORBIDDEN);
  });
  it('should return Success for valid token', async () => {
    const { statusCode } = await apiClient
      .get(`invoices?customerIds=1&sortOrder=desc&sortBy=createdAt`)
      .set('authorization', fixtures.csrAccessToken);
    expect(statusCode).toEqual(httpStatus.OK);
  });
});
