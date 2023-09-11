/* eslint-disable no-unused-vars, max-lines */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import request from '../../../helpers/request';
import {
  truck as truckSchema,
  waypoint as waypointSchema,
  location as locationSchema,
} from 'state/schema';
import * as t from './actionTypes';
import * as actions from './actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const params = { test: 'test' };
const locations = [
  { lat: 1, lon: 2 },
  { lat: 3, lon: 4 },
];
const waypointsPayload = {
  entities: {
    waypoints: {
      1: { id: 1, name: 'test' },
      2: { id: 2, name: 'test2' },
    },
  },
  result: [1, 2],
};
const trucksPayload = {
  entities: {
    trucks: {
      1: { id: 1, name: 'test' },
      2: { id: 2, name: 'test2' },
    },
  },
  result: [1, 2],
};
const truckPayload = {
  entities: {
    trucks: {
      1: { id: 1, name: 'test' },
    },
  },
  result: 1,
};
const data = { id: 1, name: 'test' };
const id = 1;

describe('Locations Action Creators', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });
  describe('Fetch Waypoints', () => {
    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.fetchWaypointsRequest()).toEqual({
        type: t.FETCH_WAYPOINTS_REQUEST,
      });
      expect(actions.fetchWaypointsSuccess(waypointsPayload)).toEqual({
        type: t.FETCH_WAYPOINTS_SUCCESS,
        payload: waypointsPayload,
        meta: {
          schema: [waypointSchema],
        },
      });
      expect(actions.fetchWaypointsFailure(error)).toEqual({
        type: t.FETCH_WAYPOINTS_FAILURE,
        error,
      });
    });

    it('should fetch waypoints', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data: waypointsPayload }));

      const expectedActions = [
        actions.fetchWaypointsRequest(),
        actions.fetchWaypointsSuccess(waypointsPayload),
      ];

      await store.dispatch(actions.fetchWaypoints());
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return an error if the request fails', async () => {
      const store = mockStore();
      const error = new Error('Test error');

      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchWaypointsRequest(),
        actions.fetchWaypointsFailure(error),
      ];

      try {
        await store.dispatch(actions.fetchWaypoints());
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
    // it('should not fetch waypoints if they already exist', async () => {
    //   const initalState = {
    //     locations: {
    //       isLoading: false,
    //       error: '',
    //       waypoints: {
    //         byId: { '1': { id: '1', name: 'Ice' } },
    //         ids: ['1'],
    //       },
    //     },
    //   };
    //   const store = mockStore(initalState);

    //   const expectedActions = [];
    //   await store.dispatch(actions.fetchWaypointsIfNeeded());
    //   expect(store.getActions()).toEqual(expectedActions);
    // });
    // it('should only fetch waypoints if necessary using isLoading', async () => {
    //   const initalState = {
    //     locations: {
    //       isLoading: true,
    //       error: '',
    //       waypoints: {
    //         byId: { '1': { id: '1', name: 'Ice' } },
    //         ids: ['1'],
    //       },
    //     },
    //   };
    //   const store = mockStore(initalState);
    //   sandbox.stub(request, 'get').returns(Promise.resolve({ data }));
    //   const expectedActions = [];
    //   await store.dispatch(actions.fetchWaypointsIfNeeded());
    //   expect(store.getActions()).toEqual(expectedActions);
    // });
    it('should only fetch waypoints if necessary', async () => {
      const initalState = {
        locations: {
          isLoading: false,
          error: '',
          waypoints: {
            byId: {},
            ids: [],
          },
        },
      };
      const store = mockStore(initalState);

      sandbox.stub(request, 'get').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.fetchWaypointsRequest(),
        actions.fetchWaypointsSuccess(data),
      ];
      await store.dispatch(actions.fetchWaypointsIfNeeded());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
  describe('Create Location', () => {
    it('should return the correct action object for createLocation', () => {
      const error = 'Test error';
      expect(actions.createLocationRequest()).toEqual({
        type: t.CREATE_LOCATION_REQUEST,
      });
      expect(actions.createLocationSuccess(data)).toEqual({
        type: t.CREATE_LOCATION_SUCCESS,
        payload: data,
        meta: {
          schema: locationSchema,
        },
      });
      expect(actions.createLocationFailure(error)).toEqual({
        type: t.CREATE_LOCATION_FAILURE,
        error,
      });
    });

    it('should produce CREATE_LOCATION_SUCCESS when creating a location is done', async () => {
      const store = mockStore();

      sandbox.stub(request, 'post').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.createLocationRequest(),
        actions.createLocationSuccess(data),
      ];

      await store.dispatch(actions.createLocation(data));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return CREATE_LOCATION_FAILURE if the location was not created', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'post').returns(Promise.reject(error));

      const expectedActions = [
        actions.createLocationRequest(),
        actions.createLocationFailure(error),
      ];

      try {
        await store.dispatch(actions.createLocation(data));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Forget Location', () => {
    it('should return type: FORGET_LOCATION', () => {
      expect(actions.forgetLocation()).toEqual({
        type: t.FORGET_LOCATION,
      });
    });
  });
  describe('Create Waypoint', () => {
    it('should return the correct action object for createWaypoint', () => {
      const error = 'Test error';
      expect(actions.createWaypointRequest()).toEqual({
        type: t.CREATE_WAYPOINT_REQUEST,
      });
      expect(actions.createWaypointSuccess(data)).toEqual({
        type: t.CREATE_WAYPOINT_SUCCESS,
        payload: data,
        meta: {
          schema: waypointSchema,
        },
      });
      expect(actions.createWaypointFailure(error)).toEqual({
        type: t.CREATE_WAYPOINT_FAILURE,
        error,
      });
    });

    it('should produce CREATE_WAYPOINT_SUCCESS when the waypoint is created', async () => {
      const store = mockStore();

      sandbox.stub(request, 'post').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.createWaypointRequest(),
        actions.createWaypointSuccess(data),
      ];

      await store.dispatch(actions.createWaypoint(data));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return CREATE_WAYPOINT_FAILURE with an error if the request fails', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'post').returns(Promise.reject(error));

      const expectedActions = [
        actions.createWaypointRequest(),
        actions.createWaypointFailure(error),
      ];

      try {
        await store.dispatch(actions.createWaypoint(data));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Update Waypoint', () => {
    it('should return the correct action object', () => {
      const error = 'Test error';
      expect(actions.updateWaypointRequest()).toEqual({
        type: t.UPDATE_WAYPOINT_REQUEST,
      });
      expect(actions.updateWaypointSuccess(id, data)).toEqual({
        type: t.UPDATE_WAYPOINT_SUCCESS,
        id,
        payload: data,
        meta: {
          schema: waypointSchema,
        },
      });
      expect(actions.updateWaypointFailure(error)).toEqual({
        type: t.UPDATE_WAYPOINT_FAILURE,
        error,
      });
    });

    it('should send request to update the location', async () => {
      const store = mockStore();

      sandbox.stub(request, 'put').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.updateWaypointRequest(),
        actions.updateWaypointSuccess(id, data),
      ];

      await store.dispatch(actions.updateWaypoint(id, data));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return failure with an error if the request fails', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'put').returns(Promise.reject(error));

      const expectedActions = [
        actions.updateWaypointRequest(),
        actions.updateWaypointFailure(error),
      ];

      try {
        await store.dispatch(actions.updateWaypoint(id, data));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Remove Waypoint', () => {
    it('should return the correct action object', () => {
      const error = 'Test error';
      expect(actions.removeWaypointRequest()).toEqual({
        type: t.REMOVE_WAYPOINT_REQUEST,
      });
      expect(actions.removeWaypointSuccess(id)).toEqual({
        type: t.REMOVE_WAYPOINT_SUCCESS,
        id,
      });
      expect(actions.removeWaypointFailure(error)).toEqual({
        type: t.REMOVE_WAYPOINT_FAILURE,
        error,
      });
    });

    it('should send the request to remove the waypoint', async () => {
      const store = mockStore();

      const del = sandbox.stub(request, 'delete').returns(Promise.resolve());

      const expectedActions = [
        actions.removeWaypointRequest(),
        actions.removeWaypointSuccess(id),
      ];

      await store.dispatch(actions.removeWaypoint(id));
      expect(store.getActions()).toEqual(expectedActions);
      expect(del.args[0][0]).toBe(`locations/${id}`);
    });

    it('should return failure if the request to delete was rejected', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'delete').returns(Promise.reject(error));

      const expectedActions = [
        actions.removeWaypointRequest(),
        actions.removeWaypointFailure(error),
      ];

      try {
        await store.dispatch(actions.removeWaypoint(id));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Fetch Trucks', () => {
    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.fetchTrucksRequest()).toEqual({
        type: t.FETCH_TRUCKS_REQUEST,
      });
      expect(actions.fetchTrucksSuccess(trucksPayload)).toEqual({
        type: t.FETCH_TRUCKS_SUCCESS,
        payload: trucksPayload,
        meta: {
          schema: [truckSchema],
        },
      });
      expect(actions.fetchTrucksFailure(error)).toEqual({
        type: t.FETCH_TRUCKS_FAILURE,
        error,
      });
    });

    it('should fetch trucks', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data: trucksPayload }));

      const expectedActions = [
        actions.fetchTrucksRequest(),
        actions.fetchTrucksSuccess(trucksPayload),
      ];

      await store.dispatch(actions.fetchTrucks());
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return an error if the request fails', async () => {
      const store = mockStore();
      const error = new Error('Test error');

      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchTrucksRequest(),
        actions.fetchTrucksFailure(error),
      ];

      try {
        await store.dispatch(actions.fetchTrucks());
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Fetch Truck', () => {
    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.fetchTruckRequest()).toEqual({
        type: t.FETCH_TRUCK_REQUEST,
      });
      expect(actions.fetchTruckSuccess(truckPayload)).toEqual({
        type: t.FETCH_TRUCK_SUCCESS,
        payload: truckPayload,
        meta: {
          schema: truckSchema,
        },
      });
      expect(actions.fetchTruckFailure(error)).toEqual({
        type: t.FETCH_TRUCK_FAILURE,
        error,
      });
    });

    it('should fetch a truck', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data: truckPayload }));

      const expectedActions = [
        actions.fetchTruckRequest(),
        actions.fetchTruckSuccess(truckPayload),
      ];

      await store.dispatch(actions.fetchTruckById(1));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return an error if the request fails', async () => {
      const store = mockStore();
      const error = new Error('Test error');

      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchTruckRequest(),
        actions.fetchTruckFailure(error),
      ];

      try {
        await store.dispatch(actions.fetchTruckById(1));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Update Truck', () => {
    it('should return the correct action object', () => {
      const error = 'Test error';
      expect(actions.updateTruckRequest()).toEqual({
        type: t.UPDATE_TRUCK_REQUEST,
      });
      expect(actions.updateTruckSuccess(id, data)).toEqual({
        type: t.UPDATE_TRUCK_SUCCESS,
        id,
        payload: data,
        meta: {
          schema: truckSchema,
        },
      });
      expect(actions.updateTruckFailure(error)).toEqual({
        type: t.UPDATE_TRUCK_FAILURE,
        error,
      });
    });

    it('should send request to update the truck', async () => {
      const store = mockStore();

      sandbox.stub(request, 'put').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.updateTruckRequest(),
        actions.updateTruckSuccess(id, data),
      ];

      await store.dispatch(actions.updateTruck(id, data));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return failure with an error if the request fails', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'put').returns(Promise.reject(error));

      const expectedActions = [
        actions.updateTruckRequest(),
        actions.updateTruckFailure(error),
      ];

      try {
        await store.dispatch(actions.updateTruck(id, data));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Create Truck', () => {
    it('should return the correct action object', () => {
      const error = 'Test error';
      expect(actions.createTruckRequest()).toEqual({
        type: t.CREATE_TRUCK_REQUEST,
      });
      expect(actions.createTruckSuccess(truckPayload)).toEqual({
        type: t.CREATE_TRUCK_SUCCESS,
        payload: truckPayload,
        meta: {
          schema: truckSchema,
        },
      });
      expect(actions.createTruckFailure(error)).toEqual({
        type: t.CREATE_TRUCK_FAILURE,
        error,
      });
    });

    it('should create a truck', async () => {
      const store = mockStore();

      sandbox.stub(request, 'post').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.createTruckRequest(),
        actions.createTruckSuccess(data),
      ];

      await store.dispatch(actions.createTruck(data));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return failure if the create request was rejected', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'post').returns(Promise.reject(error));

      const expectedActions = [
        actions.createTruckRequest(),
        actions.createTruckFailure(error),
      ];

      try {
        await store.dispatch(actions.createTruck(data));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Remove Truck', () => {
    it('should return the correct action object', () => {
      const error = 'Test error';
      expect(actions.removeTruckRequest()).toEqual({
        type: t.REMOVE_TRUCK_REQUEST,
      });
      expect(actions.removeTruckSuccess(id)).toEqual({
        type: t.REMOVE_TRUCK_SUCCESS,
        id,
      });
      expect(actions.removeTruckFailure(error)).toEqual({
        type: t.REMOVE_TRUCK_FAILURE,
        error,
      });
    });

    it('should send the request to remove the truck', async () => {
      const store = mockStore();

      const del = sandbox.stub(request, 'delete').returns(Promise.resolve());

      const expectedActions = [
        actions.removeTruckRequest(),
        actions.removeTruckSuccess(id),
      ];

      await store.dispatch(actions.removeTruck(id));
      expect(store.getActions()).toEqual(expectedActions);
      expect(del.args[0][0]).toBe(`locations/${id}`);
    });

    it('should return failure if the request to delete was rejected', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'delete').returns(Promise.reject(error));

      const expectedActions = [
        actions.removeTruckRequest(),
        actions.removeTruckFailure(error),
      ];

      try {
        await store.dispatch(actions.removeTruck(id));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
});
