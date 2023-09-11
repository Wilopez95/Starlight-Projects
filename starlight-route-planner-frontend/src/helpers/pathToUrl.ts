import { generatePath } from 'react-router';

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
    //TODO add sentry
    console.error('GeneratePath Error:', error);

    //throw error in dev mode (for information)
    if (isDev) {
      throw error;
    }

    return Paths.Lobby;
  }
};
