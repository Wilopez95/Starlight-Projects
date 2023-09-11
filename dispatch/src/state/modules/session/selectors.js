import { createSelector } from 'reselect';

export const getSession = (state) => state.session;
export const getUser = (state) => getSession(state).user;

export const selectCurrentUser = createSelector(getSession, (session) => session && session.user);

export const selectUserTimezone = createSelector(getUser, (user) => user && user.timezone);

export const makeSelectIsAuth = createSelector(
  getSession,
  (session) => session && session.isAuthorized,
);
