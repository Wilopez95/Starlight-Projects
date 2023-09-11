/* eslint-disable no-unused-vars, camelcase, babel/camelcase */
import assert from 'assert';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import * as R from 'ramda';

import request from '../../../helpers/request';
import * as t from './actionTypes';
import * as actions from './actions';
import constants from './testConstants.json';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const workOrderId = 1;
const newState = constants.workOrder.note.transitionState.START_WORK_ORDER;

const id = 1;
const workorders = [
  {
    id: 1,
    modifiedDate: '',
    modifiedBy: '',
    actionType: 'DELIVERY',
    action_alias: 'DELIVERY',
    driver: {
      modifiedDate: '',
      modifiedBy: '',
      truck: {
        modifiedDate: '',
        modifiedBy: '',
        location: {},
      },
    },
    suspensionLocation: {
      id: '',
    },
  },
  {
    id: 2,
    modifiedDate: '',
    modifiedBy: '',
    actionType: 'DELIVERY',
    action_alias: 'DELIVERY',
    driver: {
      modifiedDate: '',
      modifiedBy: '',
      truck: {
        modifiedDate: '',
        modifiedBy: '',
        location: {},
      },
    },
    suspensionLocation: {
      id: 2,
    },
  },
];
const error = 'Test error';
const bounds = 'TEST_BOUNDS';
const search = 'TEST_SEARCH';
const date = {
  startDate: '3423423423324324',
  endDate: '0990428350943503',
};

describe('WorkOrders Actions', () => {
  describe('Fetch work orders action', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('action creators should return correct object', () => {
      expect(actions.fetchWOsReq()).toEqual({
        type: t.FETCH_WOS_REQUEST,
      });

      expect(actions.fetchWOsSuccess(workorders)).toEqual({
        type: t.FETCH_WOS_SUCCESS,
        workorders,
      });

      expect(actions.fetchWOsFail(error)).toEqual({
        type: t.FETCH_WOS_FAILURE,
        error,
      });

      expect(actions.receiveFilteredWOs(workorders)).toEqual({
        type: t.RECEIVE_FILTERED_WOS,
        workorders,
      });
    });

    // it('test filter function', () => {
    //   const testFilter = (field, value, filterValue = 1) => {
    //     const workorders = [{ [field]: value }, { [field]: 0 }];

    //     const filter = { [field]: filterValue };

    //     expect(actions.filterWorkOrders(workorders, filter)).toEqual([
    //       { [field]: value },
    //     ]);
    //   };

    //   testFilter('cow', 1);
    //   testFilter('scheduledStart', '2017-01-09T14:00:00.000Z');
    //   testFilter('sos', 1);
    //   testFilter('alleyPlacement', 1);
    //   testFilter('permittedCan', 1);
    //   testFilter('earlyPickUp', 1);
    //   testFilter('cabOver', 1);
    //   testFilter('okToRoll', 1);
    //   testFilter('priority', 1);
    //   testFilter('customerProvidedProfile', 1);
    //   testFilter('status', 'ASSIGNED', 'ASSIGNED');
    //   testFilter('negotiatedFill', 1);
    //   // testFilter('suspensionLocation.', 2);

    //   const woFilteredByAction = actions.filterWorkOrders(
    //     [{ action: 'SPOT' }, { action: 'SOME_ACTION' }],
    //     {
    //       action: 'SPOT,FINAL',
    //     },
    //   );

    //   expect(woFilteredByAction).toEqual([{ action: 'SPOT' }]);

    //   const woFilteredBySuspended = actions.filterWorkOrders([
    //     {suspensionLocation: {  id: 2}, }, {suspensionLocation: { id: 2 }}]);

    //     expect(woFilteredBySuspended).toEqual([{ size: 2 }, { size: 2 }]);

    //   const woFilteredBySize = actions.filterWorkOrders(
    //     [{ size: '12' }, { size: '30' }, { size: '999' }],
    //     {
    //       size: '12,30',
    //     },
    //   );

    //   expect(woFilteredBySize).toEqual([{ size: '12' }, { size: '30' }]);

    //   const woFilteredByMaterial = actions.filterWorkOrders(
    //     [{ material: 'A' }, { material: 'B' }, { material: 'C' }],
    //     {
    //       material: 'A,B',
    //     },
    //   );

    //   expect(woFilteredByMaterial).toEqual([
    //     { material: 'A' },
    //     { material: 'B' },
    //   ]);
    // });

    // it(`should make request only when bounds or
    //           date or search was changed`, async () => {
    //   const store = mockStore({ workOrders: { list: [] } });
    //   const get = sandbox
    //     .stub(request, 'get')
    //     .returns(Promise.resolve({ data: workorders }));
    //
    //   await store.dispatch(actions.fetchWorkOrders({ bounds }));
    //   await store.dispatch(actions.fetchWorkOrders({ bounds }));
    //   expect(get.calledOnce).toBe(true);
    //
    //   await store.dispatch(actions.fetchWorkOrders({ date }));
    //   await store.dispatch(actions.fetchWorkOrders({ date }));
    //   expect(get.calledTwice).toBe(true);
    //
    //   await store.dispatch(actions.fetchWorkOrders({ search }));
    //   await store.dispatch(actions.fetchWorkOrders({ search }));
    //   expect(get.calledThrice).toBe(true);
    //
    //   await store.dispatch(actions.fetchWorkOrders({ search, bounds, date }));
    //   expect(get.callCount).toBe(4);
    //
    //   await store.dispatch(
    //     actions.fetchWorkOrders({
    //       search: 'some another search',
    //       bounds: 'some another bounds',
    //       date: {
    //         startDate: '123',
    //         endDate: '123',
    //       },
    //     }),
    //   );
    //   expect(get.callCount).toBe(5);
    // });

    // it(`should filter wo on client side when bounds or
    //           date or search was not changed`, async () => {
    //   const list = [{ cow: 0 }, { cow: 1 }];
    //   const filter = { cow: 1 };
    //   const store = mockStore({ workOrders: { list } });
    //   sandbox
    //     .stub(request, 'get')
    //     .returns(Promise.resolve({ data: workorders }));
    //
    //   await store.dispatch(actions.fetchWorkOrders({}));
    //   await store.dispatch(actions.fetchWorkOrders(filter));
    //
    //   expect(R.last(store.getActions())).toEqual(
    //     actions.receiveFilteredWOs(
    //       actions.filterWorkOrders(list, filter),
    //     ),
    //   );
    // });

    // it('should make request only with bounds, date and search filter other filters should be skip', async () => {
    //   const store = mockStore();
    //   const get = sandbox
    //     .stub(request, 'get')
    //     .returns(Promise.resolve({ data: workorders }));

    //   await store.dispatch(
    //     actions.fetchWorkOrders({
    //       bounds,
    //       date,
    //       search,
    //       cow: 1,
    //       otherFilter: 0,
    //     }),
    //   );

    //   expect(get.calledOnce).toBe(true);
    //   expect(get.args[0][1].params).toEqual(
    //     actions.decorateFilter({ bounds, search, date }),
    //   );
    // });

    // it('should receive and filter workOrders on success request', async () => {
    //   const store = mockStore();
    //   const workorders = [
    //     {
    //       cow: 1,
    //       modifiedDate: '',
    //       modifiedBy: '',
    //       driver: {
    //         modifiedDate: '',
    //         modifiedBy: '',
    //         truck: {
    //           modifiedDate: '',
    //           modifiedBy: '',
    //           location: {},
    //         },
    //       },
    //       suspensionLocation: {
    //         id: ''
    //       }
    //     },
    //     {
    //       cow: 0,
    //       modifiedDate: '',
    //       modifiedBy: '',
    //       driver: {
    //         modifiedDate: '',
    //         modifiedBy: '',
    //         truck: {
    //           modifiedDate: '',
    //           modifiedBy: '',
    //           location: {},
    //         },
    //       },
    //       suspensionLocation: {
    //         id: ''
    //       }
    //     },
    //   ];
    //   const expectedWorkorders = [
    //     {
    //       cow: 1,
    //       modifiedDate: '',
    //       modifiedBy: '',
    //       driver: {
    //         modifiedDate: '',
    //         modifiedBy: '',
    //         truck: {
    //           modifiedDate: '',
    //           modifiedBy: '',
    //           location: {},
    //         },
    //       },
    //       suspensionLocation: {
    //         id: ''
    //       }
    //     },
    //   ];
    //   const filter = {
    //     search: 'some search string',
    //     cow: 1,
    //   };
    //   sandbox
    //     .stub(request, 'get')
    //     .returns(Promise.resolve({ data: workorders }));
    //   const expectedActions = [
    //     actions.fetchWOsReq(),
    //     actions.fetchWOsSuccess(workorders),
    //     actions.receiveFilteredWOs(expectedWorkorders),
    //   ];

    //   await store.dispatch(actions.fetchWorkOrders(filter));

    //   expect(store.getActions()).toEqual(expectedActions);
    // });

    it('should not make fail action if request was canceled', async () => {
      const store = mockStore();
      const error = new Error('Cancelation');
      error.__CANCEL__ = true;
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      await store.dispatch(actions.fetchWorkOrders());

      expect(store.getActions()).toEqual([actions.fetchWOsReq()]);
    });

    it('should make fail action on bad request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchWOsReq(),
        actions.fetchWOsFail(error),
      ];

      try {
        await store.dispatch(
          actions.fetchWorkOrders({
            search: 'please, find me some good wo',
          }),
        );
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Remove WorkOrder', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.removeWoReq()).toEqual({
        type: t.REMOVE_WO_REQUEST,
      });
      expect(actions.removeWoSuccess(id)).toEqual({
        type: t.REMOVE_WO_SUCCESS,
        id,
      });
      expect(actions.removeWoFail(error)).toEqual({
        type: t.REMOVE_WO_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      const get = sandbox.stub(request, 'delete').returns(Promise.resolve());

      const expectedActions = [
        actions.removeWoReq(),
        actions.removeWoSuccess(id),
      ];

      await store.dispatch(actions.removeWorkOrder(id));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][0]).toBe(`/workorders/${id}`);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'delete').returns(Promise.reject(error));

      const expectedActions = [
        actions.removeWoReq(),
        actions.removeWoFail(error),
      ];

      try {
        await store.dispatch(actions.removeWorkOrder(1));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Set Work Order', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should send request', async () => {
      const store = mockStore();
      const mockResponse = { data: { a: 1, b: 2 } };

      const post = sandbox
        .stub(request, 'post')
        .returns(Promise.resolve(mockResponse));

      const response = await store.dispatch(
        actions.setWorkOrderState(workOrderId, newState),
      );

      expect(post.args[0][0]).toBe(actions.createPath(workOrderId, newState));
      expect(mockResponse).toEqual(response);
      expect(store.getActions()).toEqual([
        { type: t.SET_WO_STATE_REQUEST },
        { type: t.SET_WO_STATE_SUCCESS },
      ]);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'post').returns(Promise.reject(error));

      try {
        await store.dispatch(actions.setWorkOrderState(workOrderId, newState));
        assert.fail();
      } catch (err) {
        expect(store.getActions()).toEqual([
          { type: t.SET_WO_STATE_REQUEST },
          { type: t.SET_WO_STATE_FAILURE, error },
        ]);
      }
    });
  });
});
