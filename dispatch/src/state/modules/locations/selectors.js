import { createSelector } from 'reselect';

const initial = {
  locations: { byId: {}, ids: [] },
  trucks: { byId: {}, ids: [] },
  waypoints: { byId: {}, ids: [] },
  current: {},
  isLoading: false,
  error: null,
};
export const getLocations = (state) => state.locations || initial;

export const getLocationsLoading = (state) => state.locations.isLoading;

export const createSelectLocationsLocations = () =>
  createSelector(getLocations, (locationsState) => locationsState.locations);

const locsSelector = createSelectLocationsLocations();

export const locationsById = (state) => locsSelector(state).byId;

export const getLocationIds = (state) => locsSelector(state).ids;

export const selectLocations = createSelector([getLocationIds, locationsById], (ids, loc) =>
  ids.map((id) => loc[id]),
);

export const selectCurrentLocation = (state) => getLocations(state).current;
export const selectLocation = (state, id) => locsSelector(state).byId[id];

export const getTrucks = (state) => getLocations(state).trucks;

export const getTrucksById = (state) => getTrucks(state).byId;

export const getTrucksIds = (state) => getTrucks(state).ids;

export const selectTrucks = createSelector([getTrucksIds, getTrucksById], (ids, truck) =>
  ids.map((id) => truck[id]),
);

export const getWaypoints = (state) => getLocations(state).waypoints;

export const getWaypointsById = (state) => getWaypoints(state).byId;

export const selectWaypointById = (state, id) => getWaypointsById(state)[id];

export const getWaypointIds = (state) => getWaypoints(state).ids;

export const selectWaypoints = createSelector([getWaypointIds, getWaypointsById], (ids, wp) =>
  ids.map((id) => wp[id]),
);
