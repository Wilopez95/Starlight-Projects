import httpStatus from 'http-status';

import { apiClient } from '../../../client.js';
import fixtures from '../../../fixtures.js';

const URL_PREFIX = 'invoices';

describe('CSR Invoices API Flow', () => {
  it('should list invoices', async () => {
    const { statusCode, body } = await apiClient
      .get(`${URL_PREFIX}?customerIds=1&sortOrder=desc&sortBy=createdAt`)
      .set('authorization', fixtures.csrAccessToken);
    expect(statusCode).toEqual(httpStatus.OK);
    expect(Array.isArray(body)).toBe(true);
  });
});
