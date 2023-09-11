/* eslint-disable complexity */
import { combineReducers } from 'redux';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import * as t from './actionTypes';

const isLoading = (state = false, action) => {
  switch (action.type) {
    case t.CREATE_LOCATION_REQUEST:
    case t.CREATE_WAYPOINT_REQUEST:
    case t.FETCH_WAYPOINT_REQUEST:
    case t.FETCH_WAYPOINTS_REQUEST:
    case t.REMOVE_WAYPOINT_REQUEST:
    case t.FETCH_TRUCKS_REQUEST:
    case t.FETCH_TRUCK_REQUEST:
    case t.CREATE_TRUCK_REQUEST:
    case t.UPDATE_TRUCK_REQUEST:
    case t.REMOVE_TRUCK_REQUEST:
      return true;
    case t.CREATE_LOCATION_SUCCESS:
    case t.CREATE_LOCATION_FAILURE:
    case t.CREATE_WAYPOINT_SUCCESS:
    case t.CREATE_WAYPOINT_FAILURE:
    case t.FETCH_WAYPOINT_SUCCESS:
    case t.FETCH_WAYPOINTS_SUCCESS:
    case t.FETCH_WAYPOINT_FAILURE:
    case t.FETCH_WAYPOINTS_FAILURE:
    case t.REMOVE_WAYPOINT_SUCCESS:
    case t.REMOVE_WAYPOINT_FAILURE:
    case t.FETCH_TRUCKS_SUCCESS:
    case t.FETCH_TRUCKS_FAILURE:
    case t.FETCH_TRUCK_SUCCESS:
    case t.FETCH_TRUCK_FAILURE:
    case t.CREATE_TRUCK_SUCCESS:
    case t.CREATE_TRUCK_FAILURE:
    case t.UPDATE_TRUCK_SUCCESS:
    case t.UPDATE_TRUCK_FAILURE:
    case t.REMOVE_TRUCK_SUCCESS:
    case t.REMOVE_TRUCK_FAILURE:
      return false;
    default:
      return state;
  }
};

const error = (state = null, action) => {
  switch (action.type) {
    case t.CREATE_LOCATION_FAILURE:
    case t.REMOVE_WAYPOINT_FAILURE:
    case t.FETCH_TRUCKS_FAILURE:
    case t.FETCH_TRUCK_FAILURE:
    case t.CREATE_TRUCK_FAILURE:
    case t.UPDATE_TRUCK_FAILURE:
    case t.REMOVE_TRUCK_FAILURE:
    case t.FETCH_WAYPOINTS_FAILURE:
    case t.FETCH_WAYPOINT_FAILURE:
    case t.UPDATE_WAYPOINT_FAILURE:
    case t.CREATE_WAYPOINT_FAILURE:
      return action.error;
    case t.CREATE_LOCATION_REQUEST:
    case t.CREATE_LOCATION_SUCCESS:
    case t.REMOVE_WAYPOINT_REQUEST:
    case t.REMOVE_WAYPOINT_SUCCESS:
    case t.FETCH_TRUCKS_REQUEST:
    case t.FETCH_TRUCKS_SUCCESS:
    case t.FETCH_TRUCK_REQUEST:
    case t.FETCH_TRUCK_SUCCESS:
    case t.CREATE_TRUCK_REQUEST:
    case t.UPDATE_TRUCK_REQUEST:
    case t.REMOVE_TRUCK_REQUEST:
    case t.CREATE_TRUCK_SUCCESS:
    case t.UPDATE_TRUCK_SUCCESS:
    case t.REMOVE_TRUCK_SUCCESS:
    case t.FETCH_WAYPOINTS_REQUEST:
    case t.FETCH_WAYPOINTS_SUCCESS:
    case t.FETCH_WAYPOINT_REQUEST:
    case t.FETCH_WAYPOINT_SUCCESS:
    case t.UPDATE_WAYPOINT_REQUEST:
    case t.UPDATE_WAYPOINT_SUCCESS:
    case t.CREATE_WAYPOINT_REQUEST:
    case t.CREATE_WAYPOINT_SUCCESS:
      return null;
    default:
      return state;
  }
};

const initialCurrent = {};
const current = (state = initialCurrent, action) => {
  switch (action.type) {
    case t.FORGET_LOCATION:
      return initialCurrent;
    default:
      return state;
  }
};

const locationsById = (state = {}, action) => {
  switch (action.type) {
    // case RECEIVE_FILTERED_CANS:
    //   return merge({ ...state }, action.payload.entities.locations);
    case t.CREATE_LOCATION_SUCCESS:
      return {
        ...state,
        ...action.payload.entities.locations,
      };
    default:
      return state;
  }
};

const locationIds = (state = [], action) => {
  switch (action.type) {
    // case t.FETCH_LOCATIONS_SUCCESS:
    //   return [...action.payload.result];
    case t.CREATE_LOCATION_SUCCESS:
      return [...state, action.payload.result];
    default:
      return state;
  }
};

const trucksById = (state = {}, action) => {
  switch (action.type) {
    // case RECEIVE_FILTERED_CANS:
    case t.FETCH_TRUCKS_SUCCESS:
    case t.FETCH_TRUCK_SUCCESS:
      // return merge({ ...state }, action.payload.entities.trucks);
      return { ...state, ...action.payload.entities.trucks };
    case t.UPDATE_TRUCK_SUCCESS:
    case t.CREATE_TRUCK_SUCCESS:
      return {
        ...state,
        ...action.payload.entities.trucks,
      };
    case t.REMOVE_TRUCK_SUCCESS:
      return {
        ...omit(state, action.id),
      };
    default:
      return state;
  }
};

const trucksIds = (state = [], action) => {
  switch (action.type) {
    case t.FETCH_TRUCKS_SUCCESS:
      return [...action.payload.result];
    case t.CREATE_TRUCK_SUCCESS:
      return [...state, action.payload.result];
    case t.REMOVE_TRUCK_SUCCESS:
      return state.filter((id) => id !== action.id);
    default:
      return state;
  }
};

const waypointsById = (state = {}, action) => {
  switch (action.type) {
    // case RECEIVE_FILTERED_CANS:
    case t.FETCH_WAYPOINTS_SUCCESS:
    case t.FETCH_WAYPOINT_SUCCESS:
      return merge({ ...state }, action.payload.entities.waypoints);
    case t.CREATE_WAYPOINT_SUCCESS:
    case t.UPDATE_WAYPOINT_SUCCESS:
      return {
        ...action.payload.entities.waypoints,
      };
    case t.REMOVE_WAYPOINT_SUCCESS:
      return {
        ...omit(state, action.id),
      };
    default:
      return state;
  }
};

const waypointsIds = (state = [], action) => {
  switch (action.type) {
    case t.FETCH_WAYPOINTS_SUCCESS:
      // return [...state, ...action.payload.result];
      return [...action.payload.result];
    case t.CREATE_WAYPOINT_SUCCESS:
    case t.FETCH_WAYPOINT_SUCCESS:
      return [...state, action.payload.result];
    case t.REMOVE_WAYPOINT_SUCCESS:
      return state.filter((id) => id !== action.id);
    default:
      return state;
  }
};

const locations = combineReducers({
  byId: locationsById,
  ids: locationIds,
});

const trucks = combineReducers({
  byId: trucksById,
  ids: trucksIds,
});

const waypoints = combineReducers({
  byId: waypointsById,
  ids: waypointsIds,
});

export const initialState = {
  locations: { byId: {}, ids: [] },
  trucks: { byId: {}, ids: [] },
  waypoints: { byId: {}, ids: [] },
  current: {},
  isLoading: false,
  error: null,
};

const locs = combineReducers({
  locations,
  trucks,
  waypoints,
  current,
  isLoading,
  error,
});

export default locs;
