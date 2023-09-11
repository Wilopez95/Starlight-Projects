import { createSelector } from 'reselect';

const initial = {
  ids: [],
  isLoading: false,
  byId: {},
};
export const selectUsers = (state) => state.users || initial;

export const createSelectUsersLoading = () =>
  createSelector(selectUsers, (usersState) => usersState.isLoading);

export const usersByIdSelector = (state) => selectUsers(state).byId;

export const userSelector = (state, id) => selectUsers(state).byId[id];

export const userIdsSelector = (state) => selectUsers(state).ids;

export const createSelectUsers = createSelector(userIdsSelector, usersByIdSelector, (ids, users) =>
  ids.map((id) => users[id]),
);
