import { isArray, isEmpty, isString, isUndefined, omitBy, size } from 'lodash-es';

// eslint-disable-next-line @typescript-eslint/ban-types
export const normalizeListOptions = <T extends object>(options: T): Partial<T> =>
  omitBy(options, v => {
    if (isArray(v) && size(v) === 0) {
      return true;
    }

    if (isString(v) && isEmpty(v)) {
      return true;
    }

    return isUndefined(v);
  });
