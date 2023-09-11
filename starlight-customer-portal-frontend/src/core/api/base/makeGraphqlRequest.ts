import { apiConfig } from '@root/core/config';

import { ApiError } from './ApiError';
import { GraphqlRequestOptions } from './types';

const makeGraphqlRequest = async <Result>({
  query,
  variables,
  client,
  headers,
}: GraphqlRequestOptions) => {
  try {
    let graphqlClient = apiConfig.umsGraphqlClient;

    if (client === 'billing') {
      graphqlClient = apiConfig.billingGraphqlClient;
    }

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        graphqlClient.setHeader(key, value);
      });
    }

    return await graphqlClient.request<Result>(query, variables);
  } catch (error) {
    const graphqlError = (error.response?.errors || [])[0];

    if (error.response?.code) {
      throw new ApiError(error.response, 500);
    }

    switch (graphqlError?.message) {
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
