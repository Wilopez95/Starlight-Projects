import {
  fetchWaypointsRequest,
  fetchWaypointsFailure,
  fetchWaypointsSuccess,
  removeWaypointSuccess,
  fetchWaypointRequest,
  fetchWaypointFailure,
  fetchWaypointSuccess,
  createLocationRequest,
  createLocationSuccess,
  createLocationFailure,
  createWaypointRequest,
  createWaypointSuccess,
  createWaypointFailure,
  // fetchTrucksRequest,
  fetchTrucksSuccess,
  // fetchTrucksFailure,
  forgetLocation,
  createTruckSuccess,
  removeTruckSuccess,
  updateTruckSuccess,
} from './actions';
import locations from './reducer';

const initialState = {
  locations: { byId: {}, ids: [] },
  trucks: { byId: {}, ids: [] },
  waypoints: { byId: {}, ids: [] },
  current: {},
  isLoading: false,
  error: null,
};

describe('Locations reducer', () => {
  describe('fetchWaypoints', () => {
    it('should have initial state', () => {
      const state = locations(undefined, {});
      expect(state).toEqual(initialState);
    });
    it('should set isLoading state on fetch waypoints request', () => {
      const state = locations(undefined, fetchWaypointsRequest());
      const loadingState = {
        locations: { byId: {}, ids: [] },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: true,
        error: null,
      };
      expect(state).toEqual(loadingState);
    });

    it('should split the payload on success between ids and byId', () => {
      const waypointsPayload = {
        entities: {
          waypoints: {
            1: { id: 1, name: 'test' },
            2: { id: 2, name: 'test2' },
          },
        },
        result: [1, 2],
      };
      const state = locations(
        undefined,
        fetchWaypointsSuccess(waypointsPayload),
      );

      expect(state).toEqual({
        locations: { byId: {}, ids: [] },
        trucks: { byId: {}, ids: [] },
        waypoints: {
          ids: [1, 2],
          byId: {
            1: {
              id: 1,
              name: 'test',
            },
            2: {
              id: 2,
              name: 'test2',
            },
          },
        },
        current: {},
        isLoading: false,
        error: null,
      });
    });

    it('should set an error on fetch waypoints failure', () => {
      const state = locations(undefined, fetchWaypointsFailure('oh no'));

      expect(state).toEqual({
        locations: { byId: {}, ids: [] },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: 'oh no',
      });
    });
  });

  it('should remove a waypoint on @locations/REMOVE_WAYPOINT_SUCCESS', () => {
    const locationsPayload = {
      entities: {
        waypoints: {
          1: { id: 1 },
          2: { id: 2 },
        },
      },
      result: [1, 2],
    };
    let state = locations(undefined, fetchWaypointsSuccess(locationsPayload));
    state = locations(state, removeWaypointSuccess(1));

    expect(state.waypoints.ids).toHaveLength(1);
  });
  it('should return current to initial state when @locations/FORGET_LOCATION', () => {
    const initState = {
      locations: { byId: {}, ids: [] },
      waypoints: { byId: {}, ids: [] },
      trucks: {
        ids: [],
        byId: {},
      },
      current: {
        id: 1,
        name: 'test',
      },
      isLoading: false,
      error: null,
    };
    const state = locations(initState, forgetLocation());
    const current = {};
    expect(state.current).toEqual(current);
  });
  describe('fetchWaypoint', () => {
    it('should add a waypoint to the store on @locations/FETCH_WAYPOINT_SUCCESS', () => {
      const fetchedLocation = {
        entities: {
          waypoints: {
            123: { id: 123 },
          },
        },
        result: [123],
      };
      const state = locations(
        initialState,
        fetchWaypointSuccess(fetchedLocation),
      );

      const expected = {
        123: { id: 123 },
      };
      expect(state.waypoints.byId).toEqual(expected);
    });

    it('should set isLoading state on @locations/FETCH_WAYPOINT_REQUEST', () => {
      let state = locations({ current: 'testLocation', isLoading: false }, {});
      state = locations(state, fetchWaypointRequest());

      expect(state.isLoading).toBe(true);
    });

    it('should reset state on @locations/FETCH_WAYPOINT_FAILURE', () => {
      const error = 'Error';
      let state = locations({ current: 'testLocation' }, {});
      state = locations(state, fetchWaypointFailure(error));

      expect(state.error).toEqual('Error');
    });
  });
  describe('createLocation', () => {
    it('should have initial state', () => {
      const state = locations(undefined, {});
      expect(state).toEqual(initialState);
    });
    it('should set isLoading state on create location request', () => {
      const state = locations(undefined, createLocationRequest());
      const loadingState = {
        locations: { byId: {}, ids: [] },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: true,
        error: null,
      };
      expect(state).toEqual(loadingState);
    });

    it('should add the new location to the store on @locations/CREATE_LOCATION_SUCCESS', () => {
      const locPayload = {
        entities: {
          locations: {
            1: { id: 1, name: 'test' },
          },
        },
        result: 1,
      };
      const state = locations(undefined, createLocationSuccess(locPayload));

      expect(state).toEqual({
        locations: {
          ids: [1],
          byId: {
            1: {
              id: 1,
              name: 'test',
            },
          },
        },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: null,
      });
    });

    it('should set an error on @locations/CREATE_LOCATION_FAILURE', () => {
      const state = locations(undefined, createLocationFailure('oh no'));

      expect(state).toEqual({
        locations: { byId: {}, ids: [] },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: 'oh no',
      });
    });
  });
  describe('createWaypoint', () => {
    it('should have initial state', () => {
      const state = locations(undefined, {});
      expect(state).toEqual(initialState);
    });
    it('should set isLoading state on create waypoint request', () => {
      const state = locations(undefined, createWaypointRequest());
      const loadingState = {
        locations: { byId: {}, ids: [] },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: true,
        error: null,
      };
      expect(state).toEqual(loadingState);
    });

    it('should add the new waypoint to the store on @locations/CREATE_WAYPOINT_SUCCESS', () => {
      const wayPayload = {
        entities: {
          waypoints: {
            1: { id: 1, name: 'test' },
          },
        },
        result: 1,
      };
      const state = locations(undefined, createWaypointSuccess(wayPayload));

      expect(state).toEqual({
        waypoints: {
          ids: [1],
          byId: {
            1: {
              id: 1,
              name: 'test',
            },
          },
        },
        trucks: { byId: {}, ids: [] },
        locations: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: null,
      });
    });

    it('should set an error on @locations/CREATE_WAYPOINT_FAILURE', () => {
      const state = locations(undefined, createWaypointFailure('oh no'));

      expect(state).toEqual({
        locations: { byId: {}, ids: [] },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: 'oh no',
      });
    });
  });

  describe('trucks byId / ids', () => {
    it('should add the ids of the trucks on @locations/FETCH_TRUCKS_SUCCESS', () => {
      const trucksPayload = {
        entities: {
          trucks: {
            1: { id: 1, name: 'test' },
            2: { id: 2, name: 'test2' },
          },
        },
        result: [1, 2],
      };
      const state = locations(undefined, fetchTrucksSuccess(trucksPayload));

      expect(state).toEqual({
        locations: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        trucks: {
          ids: [1, 2],
          byId: {
            1: {
              id: 1,
              name: 'test',
            },
            2: {
              id: 2,
              name: 'test2',
            },
          },
        },
        current: {},
        isLoading: false,
        error: null,
      });
    });
    it('should add the truck to the state on @locations/CREATE_TRUCK_SUCCESS', () => {
      const trucksPayload = {
        entities: {
          trucks: {
            2: { id: 2, name: 'test2' },
          },
        },
        result: 2,
      };
      const initState = {
        locations: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        trucks: {
          ids: [1],
          byId: {
            1: {
              id: 1,
              name: 'test',
            },
          },
        },
        current: {},
        isLoading: false,
        error: null,
      };
      const state = locations(initState, createTruckSuccess(trucksPayload));

      expect(state).toEqual({
        locations: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        trucks: {
          ids: [1, 2],
          byId: {
            1: {
              id: 1,
              name: 'test',
            },
            2: {
              id: 2,
              name: 'test2',
            },
          },
        },
        current: {},
        isLoading: false,
        error: null,
      });
    });
    it('should update a truck in the state on @locations/UPDATE_TRUCK_SUCCESS', () => {
      const trucksPayload = {
        entities: {
          trucks: {
            2: { id: 2, name: 'tested' },
          },
        },
        result: 2,
      };
      const initState = {
        locations: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        trucks: {
          ids: [2],
          byId: {
            2: {
              id: 2,
              name: 'test',
            },
          },
        },
        current: {},
        isLoading: false,
        error: null,
      };
      const state = locations(initState, updateTruckSuccess(2, trucksPayload));

      expect(state).toEqual({
        locations: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        trucks: {
          ids: [2],
          byId: {
            2: {
              id: 2,
              name: 'tested',
            },
          },
        },
        current: {},
        isLoading: false,
        error: null,
      });
    });
    it('should remove the truck from the store on @locations/REMOVE_TRUCK_SUCCESS', () => {
      const trucksPayload = {
        entities: {
          trucks: {
            1: { id: 1, name: 'test' },
            2: { id: 2, name: 'test2' },
          },
        },
        result: [1, 2],
      };
      let state = locations(undefined, fetchTrucksSuccess(trucksPayload));
      state = locations(state, removeTruckSuccess(1));

      expect(state.trucks.ids).toHaveLength(1);
      expect(state).toEqual({
        locations: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        trucks: {
          ids: [2],
          byId: {
            2: {
              id: 2,
              name: 'test2',
            },
          },
        },
        current: {},
        isLoading: false,
        error: null,
      });
    });
  });
});
