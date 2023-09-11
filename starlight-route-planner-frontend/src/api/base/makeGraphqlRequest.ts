import { GraphQLClient } from 'graphql-request';

import { ApiError } from './ApiError';
import { GraphqlRequestOptions } from './types';

const makeGraphqlRequest =
  (client: GraphQLClient) =>
  async <Result>({ query, variables, headers }: GraphqlRequestOptions) => {
    try {
      if (headers) {
        Object.entries(headers).forEach(([key, value]) => {
          client.setHeader(key, value);
        });
      }

      return await client.request<Result>(query, variables);
    } catch (error: unknown) {
      const typedError = error as ApiError;

      const graphqlError = (typedError.response.errors ?? [])[0];

      if (typedError.response.code) {
        throw new ApiError(typedError.response, 500);
      }

      switch (graphqlError.message) {
        case 'Not authenticated':
          throw new ApiError(
            {
              code: graphqlError.extensions.code,
              message: graphqlError.message,
            },
            401,
          );

        default:
          throw new ApiError(
            {
              code: graphqlError.extensions.code,
              message: graphqlError.message,
            },
            400,
          );
      }
    }
  };

export default makeGraphqlRequest;
