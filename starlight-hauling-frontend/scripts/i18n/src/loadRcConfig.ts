import { readFileSync } from 'fs';
import path from 'path';

import { I18nSyncRcConfig } from '@root/i18n/types';

export const loadRcFile = (fileName = '.i18nrc.json'): I18nSyncRcConfig | never => {
  const rcFilePath = path.resolve(fileName);

  try {
    const file = readFileSync(rcFilePath);

    return JSON.parse(file.toString()) as I18nSyncRcConfig;
  } catch (e) {
    throw Error(
      `[I18N Sync Tool error] Unable to find configuration file, in path: ${path.resolve(
        fileName,
      )}`,
    );
  }
};
