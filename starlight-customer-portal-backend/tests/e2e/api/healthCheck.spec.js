import httpStatus from 'http-status';

import { rootClient } from '../../client.js';

describe('Health check', () => {
  it('should return OK status for health check', async () => {
    const { statusCode } = await rootClient.get(`/health-check`);
    expect(statusCode).toEqual(httpStatus.OK);
  });
});
