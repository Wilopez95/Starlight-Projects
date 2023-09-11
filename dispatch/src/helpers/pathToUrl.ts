/* eslint-disable @typescript-eslint/no-explicit-any */
import { generatePath } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { Params, Paths } from '@root/routes/routing';

export const isDev =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

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
  } catch (error: unknown) {
    Sentry.addBreadcrumb({
      category: 'Helper',
      message: `GeneratePath Error: ${JSON.stringify(error)}`,
      data: {
        path,
        params,
      },
    });
    Sentry.captureException(error);

    //throw error in dev mode (for information)
    if (isDev) {
      throw error;
    }

    return Paths.Lobby;
  }
};
