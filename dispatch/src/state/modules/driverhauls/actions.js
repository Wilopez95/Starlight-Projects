import moment from 'moment';
import request from '@root/helpers/request';
import { toast } from '@root/components/Toast';

export const FETCH_DRIVERS_HAULS_REQUEST = 'FETCH_DRIVERS_HAULS_REQUEST';
export const FETCH_DRIVERS_HAULS_SUCCESS = 'FETCH_DRIVERS_HAULS_SUCCESS';
export const FETCH_DRIVERS_HAULS_FAILURE = 'FETCH_DRIVERS_HAULS_FAILURE';
export const RECEIVE_DRIVERS_HAULS = 'RECEIVE_DRIVERS_HAULS';

export const FETCH_DRIVERS_TRIPS_REQUEST = 'FETCH_DRIVERS_TRIPS_REQUEST';
export const FETCH_DRIVERS_TRIPS_SUCCESS = 'FETCH_DRIVERS_TRIPS_SUCCESS';
export const FETCH_DRIVERS_TRIPS_FAILURE = 'FETCH_DRIVERS_TRIPS_FAILURE';
export const RECEIVE_DRIVERS_TRIPS_HAULS = 'RECEIVE_DRIVERS_TRIPS_HAULS';

export const FETCH_DRIVERS_TIMECARD_REQUEST = 'FETCH_DRIVERS_TIMECARD_REQUEST';
export const FETCH_DRIVERS_TIMECARD_SUCCESS = 'FETCH_DRIVERS_TIMECARD_SUCCESS';
export const FETCH_DRIVERS_TIMECARD_FAILURE = 'FETCH_DRIVERS_TIMECARD_FAILURE';
export const RECEIVE_DRIVERS_TIMECARD_HAULS = 'RECEIVE_DRIVERS_TIMECARD_HAULS';

export const UPDATE_DRIVER_HAULS_REQUEST = 'UPDATE_DRIVER_HAULS_REQUEST';
export const UPDATE_DRIVER_HAULS_SUCCESS = 'UPDATE_DRIVER_HAULS_SUCCESS';
export const UPDATE_DRIVER_HAULS_FAILURE = 'UPDATE_DRIVER_HAULS_FAILURE';

export const UPDATE_DRIVER_TRIPS_REQUEST = 'UPDATE_DRIVER_TRIPS_REQUEST';
export const UPDATE_DRIVER_TRIPS_SUCCESS = 'UPDATE_DRIVER_TRIPS_SUCCESS';
export const UPDATE_DRIVER_TRIPS_FAILURE = 'UPDATE_DRIVER_TRIPS_FAILURE';

//----------------------------------------
//     FETCH THE DRIVERS HAULS DATA
// i.e. v1/trips?date=1554098400000..1555653599000
//----------------------------------------

function fetchDriverHaulsReq() {
  return {
    type: FETCH_DRIVERS_HAULS_REQUEST,
  };
}

function fetchDriverHaulsSuccess(docs) {
  return {
    type: FETCH_DRIVERS_HAULS_SUCCESS,
    payload: docs,
  };
}
function fetchDriverHaulsFailure(error) {
  return {
    type: FETCH_DRIVERS_HAULS_FAILURE,
    error,
  };
}

export function fetchDriverHaulsData() {
  return async (dispatch) => {
    dispatch(fetchDriverHaulsReq());
    const startOfMonth = moment(new Date()).startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment(new Date()).endOf('month').format('YYYY-MM-DD');
    try {
      const { data } = await request.get('reports/hauls', {
        params: {
          date: `${startOfMonth}..${endOfMonth}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
      return dispatch(fetchDriverHaulsSuccess(data));
    } catch (error) {
      dispatch(fetchDriverHaulsFailure(error));
      return Promise.reject(error);
    }
  };
}
function shouldFetchDriverHauls(state) {
  const driverHauls = state.driverHauls.ids;
  return !driverHauls.length;
}

export function loadDriverHauls() {
  return (dispatch, getState) => {
    const state = getState();
    if (shouldFetchDriverHauls(state)) {
      return dispatch(fetchDriverHaulsData());
    }
    return null;
  };
}

//----------------------------------------
//     FETCH THE TIMECARD HAULS DATA
// i.e. /v1/timecards/{timeCardId}
//----------------------------------------

function fetchDriverTimecardReq() {
  return {
    type: FETCH_DRIVERS_TIMECARD_REQUEST,
  };
}

function fetchDriverTimecardSuccess(docs) {
  return {
    type: FETCH_DRIVERS_TIMECARD_SUCCESS,
    payload: docs,
  };
}
function fetchDriverTimecardFailure(error) {
  return {
    type: FETCH_DRIVERS_TIMECARD_FAILURE,
    error,
  };
}

export function fetchDriverTimecardData() {
  return async (dispatch) => {
    dispatch(fetchDriverTimecardReq());

    try {
      const { data } = await request.get('timecards');
      return dispatch(fetchDriverTimecardSuccess(data));
    } catch (error) {
      dispatch(fetchDriverTimecardFailure(error));
      return Promise.reject(error);
    }
  };
}
//----------------------------------------
//     FETCH THE TRIPS HAULS DATA
// i.e. v1/trips?date=1554098400000..1555653599000
//----------------------------------------
const today = new Date();
const todaysDate = moment().format('x');
// Gotta divide by 1000 for unix timestamp
// Math.ceil is added to prevent decimals
const startTimeDate = Math.ceil(today.setFullYear(today.getFullYear() - 1) / 1000);

function fetchDriverTripsReq() {
  return {
    type: FETCH_DRIVERS_TRIPS_REQUEST,
  };
}

function fetchDriverTripsSuccess(docs) {
  return {
    type: FETCH_DRIVERS_TRIPS_SUCCESS,
    payload: docs,
  };
}
function fetchDriverTripsFailure(error) {
  return {
    type: FETCH_DRIVERS_TRIPS_FAILURE,
    error,
  };
}

export function fetchDriverTripsData() {
  return async (dispatch) => {
    dispatch(fetchDriverTripsReq());

    try {
      const { data } = await request.get('trips', {
        params: { date: `${startTimeDate}..${todaysDate}` },
      });
      return dispatch(fetchDriverTripsSuccess(data));
    } catch (error) {
      dispatch(fetchDriverTripsFailure(error));
      return Promise.reject(error);
    }
  };
}
//----------------------------------------
//     UPDATE THE DRIVERS TIMECARDS DATA
//           i.e. /timecards/:id
//----------------------------------------
// Table Column Name = Driver Hauls Report Column Name (or driver hauls sql table )

export const updateDriverHaulsReq = () => ({
  type: UPDATE_DRIVER_HAULS_REQUEST,
});

export const updateDriverHaulsSuccess = (data) => ({
  type: UPDATE_DRIVER_HAULS_SUCCESS,
  data,
});

export const updateDriverHaulsFail = (error) => ({
  type: UPDATE_DRIVER_HAULS_FAILURE,
  error,
});

export const updateDriverHauls = (id, data) => async (dispatch) => {
  dispatch(updateDriverHaulsReq());

  try {
    const response = await request.put(`timecards/${id}`, data);
    toast.success(`Success! Timecard entry has been updated for ${response.data.createdBy}`, {
      position: toast.POSITION.BOTTOM_RIGHT,
    });
    return dispatch(updateDriverHaulsSuccess(response.data));
  } catch (error) {
    await Promise.reject(error);

    return dispatch(updateDriverHaulsFail(error));
  }
};

//----------------------------------------
//     UPDATE THE DRIVERS TRIPS DATA
//           i.e. /trips/:id
//----------------------------------------
// Table Column Name = Driver Hauls Report Column Name (or driver hauls sql table )

export const updateDriverTripsReq = () => ({
  type: UPDATE_DRIVER_TRIPS_REQUEST,
});

export const updateDriverTripsSuccess = (data) => ({
  type: UPDATE_DRIVER_TRIPS_SUCCESS,
  data,
});

export const updateDriverTripsFail = (error) => ({
  type: UPDATE_DRIVER_TRIPS_FAILURE,
  error,
});

export const updateDriverTrips = (id, data) => async (dispatch) => {
  dispatch(updateDriverTripsReq());

  try {
    const response = await request.put(`trips/${id}`, data);
    toast.success(`Success! Trips entry has been updated!`, {
      position: toast.POSITION.BOTTOM_RIGHT,
    });
    return dispatch(updateDriverTripsSuccess(response.data));
  } catch (error) {
    toast.error(error.message, {
      position: toast.POSITION.BOTTOM_RIGHT,
    });
    return dispatch(updateDriverTripsFail(error));
  }
};
