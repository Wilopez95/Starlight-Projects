import { isEqual, toPairs, differenceWith, fromPairs } from 'lodash-es';

// TODO: create deep diff implementation if needed

export const shallowDiff = <T extends Record<string, unknown>>(
  originalObject: T,
  updatedObject: T,
): Partial<T> => {
  if (isEqual(originalObject, updatedObject)) {
    return {};
  } else {
    const changes = fromPairs(
      differenceWith(toPairs(updatedObject), toPairs(originalObject), isEqual),
    );
    return changes as Partial<T>;
  }
};
