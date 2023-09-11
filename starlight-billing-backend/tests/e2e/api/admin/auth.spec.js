import httpStatus from 'http-status';

import { apiClient } from '../../../client.js';
import fixtures from '../../../fixtures.js';

describe('Admin Auth API Flow', () => {
  it('should return Unauthorized Error for invalid token', async () => {
    const { statusCode } = await apiClient
      .get(`admin/tenants`)
      .set('authorization', `${fixtures.adminAccessToken}d`);
    expect(statusCode).toEqual(httpStatus.FORBIDDEN);
  });
  it('should return Unauthorized Error for expired token', async () => {
    const { statusCode } = await apiClient
      .get(`admin/tenants`)
      .set('authorization', fixtures.adminAccessTokenExpired);
    expect(statusCode).toEqual(httpStatus.FORBIDDEN);
  });
  it('should return Success for valid token', async () => {
    const { statusCode } = await apiClient
      .get(`admin/tenants`)
      .set('authorization', fixtures.adminAccessToken);
    expect(statusCode).toEqual(httpStatus.OK);
  });
});
