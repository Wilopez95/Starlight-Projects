import { isNil, isObject } from 'lodash-es';

import {
  type AppliedFilterState,
  type FilterItem,
  type FilterState,
  type FilterValue,
} from './types';

export const convertToAppliedState = (filters: FilterState): AppliedFilterState => {
  const result: AppliedFilterState = {};

  Object.keys(filters)
    .filter(key => !isNil(filters[key]))
    .forEach(key => {
      const filterValue = filters[key] as Exclude<FilterItem, null>;

      if (filterValue) {
        if (Array.isArray(filterValue)) {
          result[key] = filterValue.map(({ value }) => value) as FilterValue;
        } else if (isObject(filterValue.value)) {
          Object.assign(result, filterValue.value);
        } else {
          result[key] = filterValue.value;
        }
      }
    });

  return result;
};
