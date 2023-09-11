import {
  graphqlClientWithExpiredToken,
  graphqlClientWithInvalidToken,
  graphqlClient,
} from '../../client.js';
import { getAllQuery } from '../../gql/queries/invoices.js';
import { getAllInput } from '../../gql/variables/invoices.js';

import { NOT_AUTHENTICATED } from '../../../errors/codes.js';

describe('CSR Auth GraphQL Flow', () => {
  it('should return Unauthorized Error for invalid token', async () => {
    try {
      await graphqlClientWithInvalidToken.request(getAllQuery, getAllInput);
    } catch (error) {
      expect(error).toBeTruthy();
      expect(error).toHaveProperty('response');
      expect(error.response).toBeTruthy();
      expect(error.response).toHaveProperty('errors');
      expect(Array.isArray(error.response.errors)).toBe(true);
      expect(error.response.errors.length === 1).toBe(true);
      expect(error.response.errors[0]).toHaveProperty('extensions');
      expect(error.response.errors[0].extensions).toHaveProperty('code');
      expect(error.response.errors[0].extensions.code).toEqual(NOT_AUTHENTICATED);
    }
  });
  it('should return Unauthorized Error for expired token', async () => {
    try {
      await graphqlClientWithExpiredToken.request(getAllQuery, getAllInput);
    } catch (error) {
      expect(error).toBeTruthy();
      expect(error).toHaveProperty('response');
      expect(error.response).toBeTruthy();
      expect(error.response).toHaveProperty('errors');
      expect(Array.isArray(error.response.errors)).toBe(true);
      expect(error.response.errors.length === 1).toBe(true);
      expect(error.response.errors[0]).toHaveProperty('extensions');
      expect(error.response.errors[0].extensions).toHaveProperty('code');
      expect(error.response.errors[0].extensions.code).toEqual(NOT_AUTHENTICATED);
    }
  });
  it('should return Success for valid token', async () => {
    try {
      const res = await graphqlClient.request(getAllQuery, getAllInput);
      expect(res).toBeTruthy();
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });
});
