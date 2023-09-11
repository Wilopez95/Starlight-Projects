
import { apiConfig } from '@root/auth/config';
import { ApiError } from './ApiError';
import { GraphqlRequestOptions } from './types';

const makeGraphqlRequest = async <Result>({
  query,
  variables,
  headers,
}: GraphqlRequestOptions) => {
  try {
    // eslint-disable-next-line prefer-const
    let graphqlClient = apiConfig.trashapiGraphqlClient;

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        graphqlClient.setHeader(key, value);
      });
    }

    return await graphqlClient.request<Result>(query, variables);
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
