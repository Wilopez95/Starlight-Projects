import fs from 'fs';

import { isFileNotExistsError, isPermissionError } from './errors.js';

const makeErrorMessage = (path, reason) => `Could not create directory ${path}: ${reason}`;

const createDirIfNotExists = async (path, { logger }, { writable = false } = {}) => {
  // eslint-disable-next-line no-bitwise
  const mode = writable ? fs.constants.W_OK | fs.constants.R_OK : fs.constants.R_OK;

  try {
    await fs.promises.access(path, mode);

    return true;
  } catch (error) {
    if (isFileNotExistsError(error)) {
      try {
        await fs.promises.mkdir(path);

        return true;
      } catch (err) {
        const message = isPermissionError(error)
          ? makeErrorMessage(path, 'no access')
          : makeErrorMessage(path, err.code);

        logger.error(message);
      }
    } else if (isPermissionError(error)) {
      logger.error(makeErrorMessage(path, 'no access'));
    } else {
      logger.error(makeErrorMessage(path, error.code));
    }
  }

  return false;
};

export default createDirIfNotExists;
