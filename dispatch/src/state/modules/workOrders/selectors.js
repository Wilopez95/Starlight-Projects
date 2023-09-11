import { createSelector } from 'reselect';

const initial = {
  active: false,
  isLoading: false,
  single: {},
  isUpdating: false,
  list: [],
  filtered: [],
  filter: {},
  suspended: [],
};

export const getWorkOrders = (state) => state.workOrders || initial;

export const createSelectFilteredWos = () => createSelector(getWorkOrders, (wos) => wos.filtered);
export const createSelectWosFilter = () => createSelector(getWorkOrders, (wos) => wos.filter);
