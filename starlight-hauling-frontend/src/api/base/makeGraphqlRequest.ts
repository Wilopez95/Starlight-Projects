import { format, isDate } from 'date-fns';

import { apiConfig } from '@root/config/api';
import { ActionCode, ActionDefaultMessages } from '@root/helpers/notifications/types';
import { dateFormatsEnUS } from '@root/i18n/format/date';

import { ApiError } from './ApiError';
import { ConnectionError } from './ConnectionError';
import { GraphqlRequestOptions } from './types';

const makeGraphqlRequest = async <Result>({
  query,
  client,
  headers,
  variables = {},
}: GraphqlRequestOptions) => {
  try {
    let graphqlClient = apiConfig.umsGraphqlClient;

    if (client === 'billing') {
      graphqlClient = apiConfig.billingGraphqlClient;
    }

    if (client === 'route-planner') {
      graphqlClient = apiConfig.routePlannerGraphqlClient;
    }

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        graphqlClient.setHeader(key, value);
      });
    }

    const normalizedVariables: Record<string, unknown> = {};

    Object.entries(variables).forEach(([key, value]) => {
      if (isDate(value)) {
        normalizedVariables[key] = format(value as Date, dateFormatsEnUS.ISO);

        return;
      }
      normalizedVariables[key] = value;
    });

    return await graphqlClient.request<Result>(query, {
      ...normalizedVariables,
      sortOrder: variables.sortOrder?.toUpperCase(),
    });
  } catch (error: unknown) {
    const typedError = error as ApiError;
    const graphqlError = typedError.response.errors?.[0];

    if (!window.navigator.onLine) {
      const connectionError = {
        code: ActionCode.NO_INTERNET,
        message: ActionDefaultMessages.CONNECTION_IS_LOST,
      };

      throw new ConnectionError(connectionError);
    }

    if (!graphqlError) {
      throw new ApiError(typedError.response, 500);
    }

    if (typedError.response.code) {
      throw new ApiError(typedError.response, Number(typedError.response.code));
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
