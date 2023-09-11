import { poError } from '../../errors';

import { IPOBaseResponse } from './types';

export const failToError = <T>(result: IPOBaseResponse<T>) => {
  if (result.response.status === 'fail') {
    poError(JSON.stringify(result));
  }
};

export const defaultLanguageCannotBeDownloaded = (lang: string) => {
  poError(`You trying to download source file, that action is redundant "language: ${lang}"`);
};
