import { LOBBY_URL } from '@starlightpro/common/constants';
import { generatePath } from 'react-router';

import { Params } from './Params';

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

    return LOBBY_URL;
  } catch (error) {
    // add error handling
    return LOBBY_URL;
  }
};
