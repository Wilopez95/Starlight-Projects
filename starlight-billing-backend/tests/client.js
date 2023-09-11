import supertest from 'supertest';
import { GraphQLClient } from 'graphql-request';

import { PORT, API_ROOT, GRAPHQL_PATH } from '../config.js';
import fixtures from './fixtures.js';

const ApiBaseURL = `http://localhost:${PORT}${API_ROOT}/v1/`;
const GqlBaseURL = `http://localhost:${PORT}${GRAPHQL_PATH}`;

export const apiClient = supertest(ApiBaseURL);
export const graphqlClient = new GraphQLClient(GqlBaseURL, {
  credentials: 'include',
  headers: {
    authorization: fixtures.csrAccessToken,
  },
});
export const graphqlClientWithInvalidToken = new GraphQLClient(GqlBaseURL, {
  credentials: 'include',
  headers: {
    authorization: `${fixtures.csrAccessToken}d`,
  },
});
export const graphqlClientWithExpiredToken = new GraphQLClient(GqlBaseURL, {
  credentials: 'include',
  headers: {
    authorization: fixtures.csrAccessTokenExpired,
  },
});
