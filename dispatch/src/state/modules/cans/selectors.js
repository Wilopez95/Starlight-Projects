import { createSelector } from 'reselect';

export const getCans = (state) => state.cans;
export const getCanFilter = (state) => getCans(state).filter;

export const getCansLoading = (state) => getCans(state).isLoading;

export const getCansIds = (state) => getCans(state).ids;
export const getCansById = (state) => getCans(state).byId;

export const selectCans = createSelector([getCansIds, getCansById], (ids, can) =>
  ids.map((id) => can[id]),
);

export const selectFilteredCans = () => createSelector(getCans, (cans) => cans.filtered);

export const selectCansList = () => createSelector(getCans, (cans) => cans.list);
