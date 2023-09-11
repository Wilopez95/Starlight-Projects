import colors from '../../../helpers/colors';
import { REMOVE_DRIVER_SUCCESS, UPDATE_DRIVER_SUCCESS } from '../driver';
// import driver from '../driver/reducer';
import * as t from './actionTypes';

const compare = (a, b) => {
  if (a.description.toLowerCase() < b.description.toLowerCase()) {
    return -1;
  }
  if (a.description.toLowerCase() > b.description.toLowerCase()) {
    return 1;
  }
  return 0;
};

const initialState = {
  status: 'UNTOUCHED',
  list: [],
  ids: [],
  added: [],
  unadded: [],
  filtered: [],
};

const fetchDriversRequest = (state) => ({
  ...state,
  status: 'LOADING',
  list: [],
});

const fetchDriversSuccess = (state) => ({
  ...state,
  status: 'SUCCESS',
  list: [],
});
const fetchDriversFailure = (state) => ({
  ...state,
  status: 'FAILURE',
  list: [],
});

const receiveDrivers = (state, driversRes) => {
  const theDrivers = driversRes.map((driver, i) => ({
    ...driver,
    color: colors[i],
  }));
  return {
    ...state,
    status: 'DONE',
    list: [...theDrivers].sort(compare),
    filtered: [...theDrivers].sort(compare),
    unadded: state.unadded.length ? state.unadded : [...theDrivers].sort(compare),
    added: state.added.length ? state.added : [],
  };
};

const addDriver = (state, driver) =>
  // newDriver.color =
  //   colors[state.list.findIndex(element => element.id === driver.id)];

  ({
    status: 'UPDATED',
    list: state.list,
    added: [driver, ...state.added].sort(compare),
    unadded: state.unadded.filter((item) => item.id !== driver.id).sort(compare),
    filtered: state.filtered.filter((item) => item.id !== driver.id).sort(compare),
  });
const addAllDrivers = (state) => ({
  status: 'ADDED_ALL',
  list: state.list.sort(compare),
  added: state.list.filter((item) => item.active === true).sort(compare),
  unadded: [],
  filtered: [],
});

const removeAddedDriver = (state, driver) => ({
  status: 'REMOVED',
  list: state.list,
  added: state.added.filter((item) => item.id !== driver.id).sort(compare),
  unadded: [driver, ...state.unadded].sort(compare),
  filtered: [driver, ...state.unadded].sort(compare),
});

const removeDriver = (state) => ({
  list: state.list,
  added: state.added.sort(compare),
  unadded: state.unadded.sort(compare),
  filtered: state.unadded.sort(compare),
});

const setFilteredDrivers = (state, data) => ({
  list: state.list.sort(compare),
  filtered: data.sort(compare),
  unadded: state.unadded.sort(compare),
  added: state.added.sort(compare),
});

export function getDriver(id) {
  return (driver) => driver.id === id;
}

export const updateDriverLocations = (state, payload) => {
  const addedDriverIds = state.added.map((driver) => driver.id);
  // array of drivers who are added, with updated locations
  const driversToUpdate = payload.filter(({ id }) => addedDriverIds.includes(id));
  const newArray = [];
  state.added.forEach((driver) => {
    if (driver.id === driversToUpdate.filter(getDriver(driver.id))[0].id) {
      const updatedDriver = driversToUpdate.filter(getDriver(driver.id))[0];

      const mergedOldNew = {
        ...driver,
        ...updatedDriver,
      };
      newArray.push(mergedOldNew);
    } else {
      newArray.push(driver);
    }
  });

  return {
    ...state,
    status: 'DONE',
    added: newArray.sort(compare),
  };
};

export const updateDriver = (state, payload) => {
  const newArray = [];
  state.list.forEach((driver) => {
    if (driver.id === payload.id) {
      const mergedOldNew = {
        ...driver,
        ...payload,
      };
      newArray.push(mergedOldNew);
    } else {
      newArray.push(driver);
    }
  });

  return {
    ...state,
    list: newArray.sort(compare),
  };
};
export default function drivers(state = initialState, action) {
  switch (action.type) {
    case t.FETCH_DRIVERS_REQUEST:
      return fetchDriversRequest(state);
    case t.FETCH_DRIVERS_SUCCESS:
      return fetchDriversSuccess(state);
    case t.FETCH_DRIVERS_FAILURE:
      return fetchDriversFailure(state);
    case t.RECEIVE_DRIVERS:
      return receiveDrivers(state, action.drivers);
    case REMOVE_DRIVER_SUCCESS:
      return removeDriver(state);
    case t.ADD_DRIVER:
      return addDriver(state, action.driver);
    case t.REMOVE_DRIVER:
      return removeAddedDriver(state, action.driver);
    case t.ADD_ALL_DRIVERS:
      return addAllDrivers(state);
    case t.SET_FILTERED_DRIVERS:
      return setFilteredDrivers(state, action.data);
    case t.UPDATE_DRIVER_LOC_SUCCESS:
      return updateDriverLocations(state, action.payload);
    case UPDATE_DRIVER_SUCCESS:
      return updateDriver(state, action.data);
    default:
      return state;
  }
}
