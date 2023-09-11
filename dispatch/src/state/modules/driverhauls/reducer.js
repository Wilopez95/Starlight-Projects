import { combineReducers } from 'redux';
import {
  FETCH_DRIVERS_HAULS_REQUEST,
  FETCH_DRIVERS_HAULS_SUCCESS,
  FETCH_DRIVERS_HAULS_FAILURE,
  UPDATE_DRIVER_HAULS_REQUEST,
  UPDATE_DRIVER_HAULS_SUCCESS,
  FETCH_DRIVERS_TRIPS_REQUEST,
  FETCH_DRIVERS_TRIPS_SUCCESS,
  FETCH_DRIVERS_TRIPS_FAILURE,
  FETCH_DRIVERS_TIMECARD_REQUEST,
  FETCH_DRIVERS_TIMECARD_SUCCESS,
  FETCH_DRIVERS_TIMECARD_FAILURE,
  UPDATE_DRIVER_TRIPS_REQUEST,
  UPDATE_DRIVER_TRIPS_SUCCESS,
  UPDATE_DRIVER_HAULS_FAILURE,
} from './actions';

const ids = (state = [], action) => {
  switch (action.type) {
    case FETCH_DRIVERS_HAULS_SUCCESS:
      return [...state, ...action.payload.map((o) => o.id)];
    default:
      return state;
  }
};

function byId(state = {}, action) {
  switch (action.type) {
    case FETCH_DRIVERS_HAULS_SUCCESS: {
      const entry = {};
      for (let i = 0; i < action.payload.length; i += 1) {
        const item = action.payload[i];
        entry[item.id] = item;
      }
      return {
        ...state,
        ...entry,
      };
    }
    case UPDATE_DRIVER_TRIPS_SUCCESS:
      return state;
    default:
      return state;
  }
}

const allResults = (state = [], action) => {
  switch (action.type) {
    case FETCH_DRIVERS_HAULS_REQUEST:
      return [state];
    case FETCH_DRIVERS_HAULS_SUCCESS:
      return [...action.payload];
    default:
      return state;
  }
};

const tripsResults = (state = [], action) => {
  switch (action.type) {
    case FETCH_DRIVERS_TRIPS_REQUEST:
    case UPDATE_DRIVER_TRIPS_REQUEST:
      return [state];
    case FETCH_DRIVERS_TRIPS_SUCCESS:
      return [...action.payload];
    case UPDATE_DRIVER_TRIPS_SUCCESS:
      return [state];
    default:
      return state;
  }
};

const timecardResults = (state = [], action) => {
  switch (action.type) {
    case FETCH_DRIVERS_TIMECARD_REQUEST:
    case UPDATE_DRIVER_HAULS_REQUEST:
      return [state];
    case FETCH_DRIVERS_TIMECARD_SUCCESS:
      return [...action.payload];
    case UPDATE_DRIVER_HAULS_SUCCESS:
      return [state];
    default:
      return state;
  }
};

const isLoading = (state = false, action) => {
  switch (action.type) {
    case FETCH_DRIVERS_HAULS_REQUEST:
      return true;
    case FETCH_DRIVERS_HAULS_SUCCESS:
    case UPDATE_DRIVER_HAULS_SUCCESS:
    case FETCH_DRIVERS_HAULS_FAILURE:
    case FETCH_DRIVERS_TIMECARD_FAILURE:
      return false;
    default:
      return state;
  }
};

function error(state = null, action) {
  switch (action.type) {
    case FETCH_DRIVERS_HAULS_FAILURE:
    case FETCH_DRIVERS_TIMECARD_FAILURE:
    case FETCH_DRIVERS_TRIPS_FAILURE:
    case UPDATE_DRIVER_HAULS_FAILURE:
      return (action.error && action.error.message) || action.error;
    case FETCH_DRIVERS_HAULS_SUCCESS:
    case FETCH_DRIVERS_TRIPS_SUCCESS:
    case FETCH_DRIVERS_TIMECARD_SUCCESS:
      return null;
    default:
      return state;
  }
}

const driverhauls = combineReducers({
  allResults,
  tripsResults,
  timecardResults,
  isLoading,
  error,
  ids,
  byId,
});

export default driverhauls;
