import moment from 'moment';
import request from '../../../helpers/request';
import makeUrl from '../../../helpers/makeUrl';
import * as t from './actionTypes';

export function fetchHaulsRequest() {
  return {
    type: t.FETCH_HAULS_REQUEST,
  };
}

export function fetchHaulsSuccess(payload) {
  return {
    type: t.FETCH_HAULS_SUCCESS,
    payload,
  };
}

export function fetchHaulsFailure(error) {
  return {
    type: t.FETCH_HAULS_FAILURE,
    error,
  };
}

export const fetchHauls = () => async (dispatch) => {
  dispatch(fetchHaulsRequest());
  try {
    // start date to call workorder api
    const today = moment(new Date()).format('YYYY-MM-DD');

    // 3 day forecast, need date to be YYYY-MM-DD (0 placeholders needed)
    const lastDay = moment(new Date()).add(3, 'days').format('YYYY-MM-DD');

    const params = {
      date: `${today}..${lastDay}`,
    };
    const reqUrl = makeUrl('workorders', params);
    // make the api call
    const { data } = await request.get(reqUrl);

    dispatch(fetchHaulsSuccess(data));
  } catch (error) {
    dispatch(fetchHaulsFailure(error));
    Promise.reject(error);
  }
};

export function fetchCansAtWpReq() {
  return {
    type: t.FETCH_CANS_AT_WP_REQUEST,
  };
}

export function fetchCansAtWpSuccess(payload, allSizesWith0Count) {
  return {
    type: t.FETCH_CANS_AT_WP_SUCCESS,
    payload,
    allSizesWith0Count,
  };
}

export function fetchCansAtWpFail(error) {
  return {
    type: t.FETCH_CANS_AT_WP_FAILURE,
    error,
  };
}

/**
 *
 * @name getAllSizesWith0Count
 * @param {Array} data - the cans at waypoints or on trucks
 * @returns {Object} sizes with 0
 *
 * @yields an object with all can sizes quantity set to 0
 *  {10: 0, 12: 0, 20: 0, 30: 0, 40: 0, 40CT: 0}
 */
export function getAllSizesWith0Count(data) {
  return data.reduce((aggregator, canData) => {
    const { size } = canData;

    aggregator[size] = 0;
    return aggregator;
  }, {});
}

/**
 * @function getWaypointIds
 * @description fetches all waypoints from the server
 * and returns an array of their ids
 * @returns {Array} - waypoint ids
 */
export async function getWaypointIds() {
  const paramsLocations = { type: 'WAYPOINT' };
  const locationsRequest = makeUrl('locations', paramsLocations);
  try {
    const { data } = await request.get(locationsRequest);
    const waypointIds = [];
    for (const wp of data) {
      // expected output: 1
      waypointIds.push(wp.id);
    }
    return waypointIds;
  } catch (err) {
    return Promise.reject(err);
  }
}

/**
 * @function getTruckIds
 * @description fetches all trucks from the server
 * and returns an array of their ids
 * @returns {Array} - truck ids
 */
export async function getTruckIds() {
  // const paramsLocations = { withTransactions: 0 };
  const locationsRequest = makeUrl('drivers');
  try {
    const { data } = await request.get(locationsRequest);

    const truckIds = [];
    for (const driver of data) {
      // expected output: 1
      if (driver.truckId !== null) {
        truckIds.push(driver.truckId);
      }
    }
    return truckIds;
  } catch (err) {
    return Promise.reject(err);
  }
}

export const fetchCansAtWaypoints = () => async (dispatch) => {
  dispatch(fetchCansAtWpReq());
  const waypointIds = await getWaypointIds();

  try {
    const params = {
      locationId: waypointIds,
      withTransactions: 0,
      outOfService: 0,
    };

    const reqUrl = makeUrl('cans', params);

    const { data } = await request.get(reqUrl);

    const allSizesWith0Count = getAllSizesWith0Count(data);

    return dispatch(fetchCansAtWpSuccess(data, allSizesWith0Count));
  } catch (error) {
    dispatch(fetchCansAtWpFail(error));
    return Promise.reject(error);
  }
};

export function fetchCansOnTrucksRequest() {
  return { type: t.FETCH_CANS_ON_TRUCKS_REQUEST };
}

export function fetchCansOnTrucksSuccess(payload, allCansOnTruckSizesWith0Count) {
  return {
    type: t.FETCH_CANS_ON_TRUCKS_SUCCESS,
    payload,
    allCansOnTruckSizesWith0Count,
  };
}

export function fetchCansOnTrucksFailure(error) {
  return { type: t.FETCH_CANS_ON_TRUCKS_FAILURE, error };
}

export const fetchCansOnTrucks = (businessUnit) => async (dispatch) => {
  dispatch(fetchCansOnTrucksRequest());

  try {
    const params = {
      withTruckIds: 1,
      withTransactions: 0,
      businessUnitId: businessUnit,
    };

    const reqUrl = makeUrl('cans', params);

    const { data } = await request.get(reqUrl);
    // cans from byTruckId return with all cans for now
    const actualCansOnTruck = data.filter((can) => can.truckId !== null);

    const allCansOnTruckSizesWith0Count = getAllSizesWith0Count(actualCansOnTruck);
    return dispatch(fetchCansOnTrucksSuccess(data, allCansOnTruckSizesWith0Count));
  } catch (error) {
    dispatch(fetchCansOnTrucksFailure(error));
    return Promise.reject(error);
  }
};
