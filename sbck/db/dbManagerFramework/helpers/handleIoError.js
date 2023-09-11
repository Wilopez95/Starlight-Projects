import MigrationError from '../MigrationError.js';
import { isFileNotExistsError } from './errors.js';

const handleIoError = (path, error, defaultResult) => {
  if (isFileNotExistsError(error)) {
    return defaultResult;
  } else {
    throw new MigrationError(`Could not access ${path}: ${error.code}`);
  }
};

export default handleIoError;
