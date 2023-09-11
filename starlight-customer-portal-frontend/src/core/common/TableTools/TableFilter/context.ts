import { createContext } from 'react';
import { noop } from 'lodash-es';

import { IFilterConfigContext, ITableFilterContext } from './types';

export const FilterConfigContext = createContext<IFilterConfigContext>({
  filterByKey: '',
  filterState: {},
  setFilterValue: noop,
  removeFilterValue: noop,
});

export const FilterContext = createContext<ITableFilterContext>({
  isFilterOpen: false,
  onChangeAppliedState: noop,
});
