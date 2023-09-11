import { generatePath } from 'react-router';
import * as Sentry from '@sentry/react';
import { ApiError } from '@root/api/base/ApiError';
import { Params, Paths } from '@root/consts';
import { isDev } from '@root/helpers/environment';

type ParamsRecord = {
  [P in keyof typeof Params]?: string | number;
};

export const pathToUrl = (path: string, params: ParamsRecord = {}) => {
  try {
    // can return empty string
    const maybeUrl = generatePath(path, params);

    if (maybeUrl) {
      return maybeUrl;
    }

    return Paths.Lobby;
  } catch (error) {
    const typedError = error as ApiError;

    Sentry.addBreadcrumb({
      category: 'Helper',
      message: `GeneratePath Error: ${JSON.stringify(typedError.message)}`,
      data: {
        path,
        params,
      },
    });
    Sentry.captureException(typedError);

    // throw error in dev mode (for information)
    if (isDev) {
      throw error;
    }

    return Paths.Lobby;
  }
};
