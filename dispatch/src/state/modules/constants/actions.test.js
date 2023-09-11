/* eslint-disable no-catch-shadow, no-unused-vars */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import request from '../../../helpers/request';
import * as actions from './actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const data = {
  can: {
    action: {
      MOVE: 'MOVE',
      PICKUP: 'PICKUP',
      DROPOFF: 'DROPOFF',
      TRANSFER: 'TRANSFER',
      NOTE: 'NOTE',
      UPDATE: 'UPDATE',
      REMOVE: 'REMOVE',
      CREATE: 'CREATE',
    },
    size: ['1', '2', '5', '10', '12', '20', '29', '30', '40', '40CT'],
  },
  location: {
    type: {},
  },
  workOrder: {
    action: {},
    status: {},
    material: [],
    note: {
      transitionState: {},
    },
  },
  import: {
    type: {},
  },
};

describe('Constant Actions', () => {
  describe('Fetch Constants', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return the correct action type', () => {
      const error = 'Test error';
      expect(actions.fetchConstantsRequest()).toEqual({
        type: actions.FETCH_CONSTANTS_REQUEST,
      });
      expect(actions.fetchConstantsSuccess(data)).toEqual({
        type: actions.FETCH_CONSTANTS_SUCCESS,
        payload: data,
      });
      expect(actions.fetchConstantsFailure(error)).toEqual({
        type: actions.FETCH_CONSTANTS_FAILURE,
        error,
      });
    });

    it('should fetch constants', async () => {
      const store = mockStore();

      sandbox.stub(request, 'get').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.fetchConstantsRequest(),
        actions.fetchConstantsSuccess(data),
      ];

      await store.dispatch(actions.fetchConstants());
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return error on a rejected request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchConstantsRequest(),
        actions.fetchConstantsFailure(error),
      ];

      try {
        await store.dispatch(actions.fetchConstants());
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
    // it('should only fetch constants if necessary using hasFetched', async () => {
    //   const initalState = {
    //     constants: {
    //       isLoading: false,
    //       hasFetched: true,
    //       error: '',
    //       can: {
    //         action: {
    //           MOVE: 'MOVE',
    //           PICKUP: 'PICKUP',
    //           DROPOFF: 'DROPOFF',
    //           TRANSFER: 'TRANSFER',
    //           NOTE: 'NOTE',
    //           UPDATE: 'UPDATE',
    //           REMOVE: 'REMOVE',
    //           CREATE: 'CREATE',
    //         },
    //         size: ['1', '2', '5', '10', '12', '20', '29', '30', '40', '40CT'],
    //       },
    //       location: {
    //         type: {},
    //       },
    //       workOrder: {
    //         action: {},
    //         status: {},
    //         material: [],
    //         note: {
    //           transitionState: {},
    //         },
    //       },
    //       import: {
    //         type: {},
    //       },
    //     },
    //   };
    //   const store = mockStore(initalState);

    //   const expectedActions = [];
    //   await store.dispatch(actions.fetchConstantsIfNeeded());
    //   expect(store.getActions()).toEqual(expectedActions);
    // });
    // it('should only fetch constants if necessary using isLoading', async () => {
    //   const initalState = {
    //     constants: {
    //       isLoading: true,
    //       hasFetched: true,
    //       error: '',
    //       can: {
    //         action: {
    //           MOVE: 'MOVE',
    //           PICKUP: 'PICKUP',
    //           DROPOFF: 'DROPOFF',
    //           TRANSFER: 'TRANSFER',
    //           NOTE: 'NOTE',
    //           UPDATE: 'UPDATE',
    //           REMOVE: 'REMOVE',
    //           CREATE: 'CREATE',
    //         },
    //         size: ['1', '2', '5', '10', '12', '20', '29', '30', '40', '40CT'],
    //       },
    //       location: {
    //         type: {},
    //       },
    //       workOrder: {
    //         action: {},
    //         status: {},
    //         material: [],
    //         note: {
    //           transitionState: {},
    //         },
    //       },
    //       import: {
    //         type: {},
    //       },
    //     },
    //   };
    //   const store = mockStore(initalState);

    //   const expectedActions = [];
    //   await store.dispatch(actions.fetchConstantsIfNeeded());
    //   expect(store.getActions()).toEqual(expectedActions);
    // });
    // it('should only fetch constants if necessary', async () => {
    //   const initalState = {
    //     constants: {
    //       isLoading: false,
    //       hasFetched: false,
    //       error: '',
    //       can: {
    //         action: {
    //           MOVE: 'MOVE',
    //           PICKUP: 'PICKUP',
    //           DROPOFF: 'DROPOFF',
    //           TRANSFER: 'TRANSFER',
    //           NOTE: 'NOTE',
    //           UPDATE: 'UPDATE',
    //           REMOVE: 'REMOVE',
    //           CREATE: 'CREATE',
    //         },
    //         size: ['1', '2', '5', '10', '12', '20', '29', '30', '40', '40CT'],
    //       },
    //       location: {
    //         type: {},
    //       },
    //       workOrder: {
    //         action: {},
    //         status: {},
    //         material: [],
    //         note: {
    //           transitionState: {},
    //         },
    //       },
    //       import: {
    //         type: {},
    //       },
    //     },
    //   };
    //   const store = mockStore(initalState);

    //   sandbox.stub(request, 'get').returns(Promise.resolve({ data }));

    //   const expectedActions = [
    //     actions.fetchConstantsRequest(),
    //     actions.fetchConstantsSuccess(data),
    //   ];
    //   await store.dispatch(actions.fetchConstantsIfNeeded());
    //   expect(store.getActions()).toEqual(expectedActions);
    // });
  });
});
