import request from '../../../helpers/request';
import * as t from './actionTypes';

export function exportDriversRequest() {
  return { type: t.EXPORT_DRIVERS_REQUEST };
}

export function exportDriversSuccess() {
  return { type: t.EXPORT_DRIVERS_SUCCESS };
}

export function exportDriversFailure(error) {
  return { type: t.EXPORT_DRIVERS_FAILURE, error };
}

export function exportDrivers(params = {}) {
  return async (dispatch) => {
    dispatch(exportDriversRequest());

    try {
      const response = await request.get('/reports/drivers', { params });
      dispatch(exportDriversSuccess());
      return response;
    } catch (error) {
      dispatch(exportDriversFailure(error));
      return Promise.reject(error);
    }
  };
}
export function fetchDriversRequest(search) {
  return { type: t.FETCH_DRIVERS_REQUEST, search };
}

export function fetchDriversSuccess(drivers = []) {
  return { type: t.FETCH_DRIVERS_SUCCESS, drivers };
}

export function fetchDriversFailure(error) {
  return { type: t.FETCH_DRIVERS_FAILURE, error };
}

export function receiveDrivers(drivers = []) {
  return { type: t.RECEIVE_DRIVERS, drivers };
}

export function addDriver(driver = {}) {
  return { type: t.ADD_DRIVER, driver };
}

export function removeAddedDriver(driver = {}) {
  return { type: t.REMOVE_DRIVER, driver };
}

export function addAllDrivers() {
  return { type: t.ADD_ALL_DRIVERS };
}

export const setFilteredDrivers = (data) => ({
  type: t.SET_FILTERED_DRIVERS,
  data,
});

export function fetchDrivers(search) {
  return (dispatch) => {
    dispatch(fetchDriversRequest(search));
    return request
      .get('drivers', { params: { ...search } })
      .then(({ data }) => {
        dispatch(fetchDriversSuccess(data));
        dispatch(receiveDrivers(data));
        return data;
      })
      .catch(({ data }) => dispatch(fetchDriversFailure(data)));
  };
}

export function fetchDriversInitially(search) {
  return (dispatch) => {
    dispatch(fetchDriversRequest(search));
    return request
      .get('drivers', { params: { ...search } })
      .then(({ data }) => {
        dispatch(fetchDriversSuccess(data));
        dispatch(receiveDrivers(data));
        return data;
      })
      .catch(({ data, response }) => {
        // we need to refresh it in case all permission are not updated always
        if (response.status === 403) {
          window.location.reload();
        }
        return dispatch(fetchDriversFailure(data));
      });
  };
}
export function updateDriverLocRequest() {
  return { type: t.UPDATE_DRIVER_LOC_REQUEST };
}

export function updateDriverLocSuccess(drivers) {
  return {
    type: t.UPDATE_DRIVER_LOC_SUCCESS,
    payload: drivers,
  };
}

export function updateDriverLocsFailure(error) {
  return { type: t.UPDATE_DRIVER_LOC_FAILURE, error };
}

export function updateDriverLocations(params = {}) {
  return (dispatch) => {
    dispatch(updateDriverLocRequest());

    return request
      .get('drivers', { params })
      .then(({ data }) => {
        dispatch(updateDriverLocSuccess(data));
      })
      .catch((error) => dispatch(updateDriverLocsFailure(error)));
  };
}
