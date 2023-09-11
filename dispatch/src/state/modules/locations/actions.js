import request from "../../../helpers/request";
import makeUrl from "../../../helpers/makeUrl";
import {
  location as locationSchema,
  truck as truckSchema,
  waypoint as waypointSchema,
} from "../../schema";
import * as t from "./actionTypes";

export function createLocationRequest() {
  return { type: t.CREATE_LOCATION_REQUEST };
}

export function createLocationSuccess(data) {
  return {
    type: t.CREATE_LOCATION_SUCCESS,
    payload: data,
    meta: { schema: locationSchema },
  };
}

export function createLocationFailure(error) {
  return { type: t.CREATE_LOCATION_FAILURE, error };
}

export function createLocation(data) {
  return async (dispatch) => {
    dispatch(createLocationRequest());

    try {
      const response = await request.post("/locations", data);
      dispatch(createLocationSuccess(response.data));
    } catch (error) {
      dispatch(createLocationFailure(error));
      Promise.reject(error);
    }
  };
}

export function forgetLocation() {
  return { type: t.FORGET_LOCATION };
}

export function fetchTrucksRequest() {
  return { type: t.FETCH_TRUCKS_REQUEST };
}

export function fetchTrucksSuccess(trucks) {
  return {
    type: t.FETCH_TRUCKS_SUCCESS,
    payload: trucks,
    meta: {
      schema: [truckSchema],
    },
  };
}

export function fetchTrucksFailure(error) {
  return { type: t.FETCH_TRUCKS_FAILURE, error };
}

export const fetchTrucks = (params) => async (dispatch) => {
  dispatch(fetchTrucksRequest());

  try {
    const reqUrl = makeUrl("trucks", params);
    const { data } = await request.get(reqUrl);
    dispatch(fetchTrucksSuccess(data));
  } catch (error) {
    dispatch(fetchTrucksFailure(error));
    Promise.reject(error);
  }
};

// function shouldFetchTrucks(state) {
//   const trucks = state.locations.trucks.ids;
//   if (trucks.length < 1) {
//     return true;
//   } else if (state.locations.isLoading) {
//     return false;
//   }
//   return false;
// }

export function fetchTrucksIfNeeded(params = {}) {
  return (dispatch) => dispatch(fetchTrucks(params));
  // if (shouldFetchTrucks(getState())) {
  //   return dispatch(fetchTrucks());
  // }
  // return null;
}
export function fetchTruckRequest() {
  return { type: t.FETCH_TRUCK_REQUEST };
}

export function fetchTruckSuccess(truck) {
  return {
    type: t.FETCH_TRUCK_SUCCESS,
    payload: truck,
    meta: {
      schema: truckSchema,
    },
  };
}

export function fetchTruckFailure(error) {
  return { type: t.FETCH_TRUCK_FAILURE, error };
}

export const fetchTruckById = (id) => async (dispatch) => {
  dispatch(fetchTruckRequest());

  try {
    const { data } = await request.get(`locations/${id}`);
    dispatch(fetchTruckSuccess(data));
  } catch (error) {
    dispatch(fetchTruckFailure(error));
    Promise.reject(error);
  }
};

export function createTruckRequest() {
  return { type: t.CREATE_TRUCK_REQUEST };
}

export function createTruckSuccess(data) {
  return {
    type: t.CREATE_TRUCK_SUCCESS,
    payload: data,
    meta: { schema: truckSchema },
  };
}

export function createTruckFailure(error) {
  return { type: t.CREATE_TRUCK_FAILURE, error };
}

export function createTruck(data) {
  return async (dispatch) => {
    dispatch(createTruckRequest());

    try {
      const response = await request.post("/locations", data);
      dispatch(createTruckSuccess(response.data));
    } catch (error) {
      dispatch(createTruckFailure(error));
      Promise.reject(error);
    }
  };
}

export function updateTruckRequest() {
  return {
    type: t.UPDATE_TRUCK_REQUEST,
  };
}

export function updateTruckSuccess(id, data) {
  return {
    type: t.UPDATE_TRUCK_SUCCESS,
    id,
    payload: data,
    meta: { schema: truckSchema },
  };
}

export function updateTruckFailure(error) {
  return {
    type: t.UPDATE_TRUCK_FAILURE,
    error,
  };
}

export function updateTruck(id, data) {
  return async (dispatch) => {
    dispatch(updateTruckRequest());

    try {
      const response = await request.put(`locations/${id}`, data);
      dispatch(updateTruckSuccess(id, response.data));
    } catch (error) {
      dispatch(updateTruckFailure(error));
      Promise.reject(error);
    }
  };
}

export function removeTruckRequest() {
  return { type: t.REMOVE_TRUCK_REQUEST };
}

export function removeTruckSuccess(id) {
  return { type: t.REMOVE_TRUCK_SUCCESS, id };
}

export function removeTruckFailure(error) {
  return { type: t.REMOVE_TRUCK_FAILURE, error };
}

export function removeTruck(id) {
  return async (dispatch) => {
    dispatch(removeTruckRequest());

    try {
      await request.delete(`locations/${id}`);
      dispatch(removeTruckSuccess(id));
    } catch (error) {
      dispatch(removeTruckFailure(error));
      Promise.reject(error);
    }
  };
}
export function fetchWaypointsRequest() {
  return { type: t.FETCH_WAYPOINTS_REQUEST };
}

export function fetchWaypointsSuccess(waypoints) {
  return {
    type: t.FETCH_WAYPOINTS_SUCCESS,
    payload: waypoints,
    meta: {
      schema: [waypointSchema],
    },
  };
}

export function fetchWaypointsFailure(error) {
  return { type: t.FETCH_WAYPOINTS_FAILURE, error };
}

export const fetchWaypoints = () => async (dispatch) => {
  dispatch(fetchWaypointsRequest());
  const params = { type: "WAYPOINT" };
  const reqUrl = makeUrl("locations", params);

  try {
    const { data } = await request.get(reqUrl);
    dispatch(fetchWaypointsSuccess(data));
  } catch (error) {
    dispatch(fetchWaypointsFailure(error));
    Promise.reject(error);
  }
};

export const fetchWaypointsByName =
  (name = "", isSuspendedOrder, isCoreItem, coreId) =>
  async (dispatch) => {
    dispatch(fetchWaypointsRequest());
    const params = isCoreItem
      ? {
          description: name,
        }
      : {
          type: isSuspendedOrder ? "WAYPOINT" : "WAYPOINT,LOCATION",
          name,
        };
    const reqUrl = makeUrl(
      isCoreItem ? `workorders/${coreId}/disposal-sites` : "locations",
      params
    );
    try {
      const { data } = await request.get(reqUrl);
      dispatch(fetchWaypointsSuccess(data));
      return data;
    } catch (error) {
      dispatch(fetchWaypointsFailure(error));
      return Promise.reject(error);
    }
  };

export function fetchWaypointsIfNeeded() {
  return (dispatch) => dispatch(fetchWaypoints());
}

export function fetchWaypointRequest() {
  return { type: t.FETCH_WAYPOINT_REQUEST };
}

export function fetchWaypointSuccess(waypoints) {
  return {
    type: t.FETCH_WAYPOINT_SUCCESS,
    payload: waypoints,
    meta: {
      schema: waypointSchema,
    },
  };
}

export function fetchWaypointFailure(error) {
  return { type: t.FETCH_WAYPOINT_FAILURE, error };
}

export const fetchWaypoint = (id) => async (dispatch) => {
  dispatch(fetchWaypointRequest());
  try {
    const { data } = await request.get(`locations/${id}`);
    dispatch(fetchWaypointSuccess(data));
  } catch (error) {
    dispatch(fetchWaypointFailure(error));
    Promise.reject(error);
  }
};

export function createWaypointRequest() {
  return { type: t.CREATE_WAYPOINT_REQUEST };
}

export function createWaypointSuccess(data) {
  return {
    type: t.CREATE_WAYPOINT_SUCCESS,
    payload: data,
    meta: { schema: waypointSchema },
  };
}

export function createWaypointFailure(error) {
  return { type: t.CREATE_WAYPOINT_FAILURE, error };
}

export function createWaypoint(data) {
  return async (dispatch) => {
    dispatch(createWaypointRequest());

    try {
      const response = await request.post("/locations", data);
      dispatch(createWaypointSuccess(response.data));
    } catch (error) {
      dispatch(createWaypointFailure(error));
      Promise.reject(error);
    }
  };
}

export function updateWaypointRequest() {
  return {
    type: t.UPDATE_WAYPOINT_REQUEST,
  };
}

export function updateWaypointSuccess(id, data) {
  return {
    type: t.UPDATE_WAYPOINT_SUCCESS,
    id,
    payload: data,
    meta: { schema: waypointSchema },
  };
}

export function updateWaypointFailure(error) {
  return {
    type: t.UPDATE_WAYPOINT_FAILURE,
    error,
  };
}

export function updateWaypoint(id, data) {
  return async (dispatch) => {
    dispatch(updateWaypointRequest());

    try {
      const response = await request.put(`locations/${id}`, data);
      dispatch(updateWaypointSuccess(id, response.data));
    } catch (error) {
      dispatch(updateWaypointFailure(error));
      Promise.reject(error);
    }
  };
}

export function removeWaypointRequest() {
  return { type: t.REMOVE_WAYPOINT_REQUEST };
}

export function removeWaypointSuccess(id) {
  return { type: t.REMOVE_WAYPOINT_SUCCESS, id };
}

export function removeWaypointFailure(error) {
  return { type: t.REMOVE_WAYPOINT_FAILURE, error };
}

export function removeWaypoint(id) {
  return async (dispatch) => {
    dispatch(removeWaypointRequest());

    try {
      await request.delete(`locations/${id}`);
      dispatch(removeWaypointSuccess(id));
    } catch (error) {
      dispatch(removeWaypointFailure(error));
      Promise.reject(error);
    }
  };
}
