export {
  createLocation,
  forgetLocation,
  fetchTrucks,
  fetchTrucksIfNeeded,
  fetchTruckById,
  createTruck,
  updateTruck,
  removeTruck,
  fetchWaypoints,
  createWaypoint,
  updateWaypoint,
  removeWaypoint,
  fetchWaypoint,
  fetchWaypointsIfNeeded,
} from './actions';

export { default as locations } from './reducer';

export {
  getLocations,
  locationsById,
  getLocationIds,
  selectLocations,
  selectLocation,
  selectCurrentLocation,
  getLocationsLoading,
  getTrucks,
  getTrucksById,
  getTrucksIds,
  selectTrucks,
  selectWaypoints,
  selectWaypointById,
} from './selectors';
