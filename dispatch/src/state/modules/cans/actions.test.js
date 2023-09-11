/* eslint-disable no-unused-vars, max-lines */
import assert from 'assert';
import sinon from 'sinon';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as R from 'ramda';
import request from '../../../helpers/request';
import * as actions from './actions';
import * as t from './actionTypes';

const {
  fetchTransactionsFailure,
  fetchTransactionsSuccess,
  fetchTransactionsRequest,
  setActiveCan,
} = actions;

const can = {
  id: 1,
};
const type = 'APPEND';
const data = '123';
const dataAdd = { id: 1 };
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const params = {
  date: '123',
  bounds: '123:321',
};
const singleData = { test: 'test' };
const singleId = 1;
const singleLocation = { lat: 1, lon: 2 };

const singleTruck = { lat: 1, lon: 2 };
const dataReport = { id: 1 };
const paramsReport = {
  date: '2017-10-01',
  timezone: 'America/Denver',
};

const cans = [{ id: 1 }, { id: 2 }];
const dataFetch = { loading: true };
const error = 'Test error';
const bounds = 'TEST_BOUNDS';
const allowNullLocations = true;
const status = 'DROPOFF';
const search = 'TEST_SEARCH';
const date = {
  startDate: '3423423423324324',
  endDate: '0990428350943503',
};

const canRequiresMaintenance = {
  requiresMaintenance: 1,
};

const canOutOfService = {
  outOfService: 1,
};

const canHazardous = {
  hazardous: 1,
};

const simpleCan = {
  hazardous: 0,
  outOfService: 0,
  requiresMaintenance: 0,
};

describe('Cans Actions', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Set Active Can', () => {
    it('should not dispatch failure if request was canceled', async () => {
      const store = mockStore();
      const error = new Error('Cancelation');
      error.__CANCEL__ = true;
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      await store.dispatch(setActiveCan(can, true));

      expect(store.getActions()).toEqual([fetchTransactionsRequest(can)]);
    });

    it('should dispatch failure on bad request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        fetchTransactionsRequest(can),
        fetchTransactionsFailure(),
      ];

      try {
        await store.dispatch(setActiveCan(can, true));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });

    it('should not dispatch request action if loading is set to false', async () => {
      const store = mockStore();
      sandbox.stub(request, 'get').returns(Promise.resolve({ data: '42' }));

      const expectedActions = [fetchTransactionsSuccess('42')];
      await store.dispatch(setActiveCan(can));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('Export Cans', () => {
    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.exportCansRequest()).toEqual({
        type: t.EXPORT_CANS_REQUEST,
      });
      expect(actions.exportCansSuccess()).toEqual({
        type: t.EXPORT_CANS_SUCCESS,
      });
      expect(actions.exportCansFailure(error)).toEqual({
        type: t.EXPORT_CANS_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data: '' }));

      const expectedActions = [
        actions.exportCansRequest(),
        actions.exportCansSuccess(),
      ];

      await store.dispatch(actions.exportCans(params));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][1]).toEqual({ params });
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.exportCansRequest(),
        actions.exportCansFailure(error),
      ];

      try {
        await store.dispatch(actions.exportCans(params));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Import Cans', () => {
    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.importCansRequest()).toEqual({
        type: t.IMPORT_CANS_REQUEST,
      });
      expect(actions.importCansSuccess()).toEqual({
        type: t.IMPORT_CANS_SUCCESS,
      });
      expect(actions.importCansFailure(error)).toEqual({
        type: t.IMPORT_CANS_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const params = { type };
      const store = mockStore();
      const post = sandbox.stub(request, 'post').returns(Promise.resolve());

      const expectedActions = [
        actions.importCansRequest(),
        actions.importCansSuccess(),
      ];

      await store.dispatch(actions.importCans(type, data));
      expect(store.getActions()).toEqual(expectedActions);

      expect(post.args[0][1]).toBe(data);
      expect(post.args[0][2]).toEqual({ params });
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'post').returns(Promise.reject(error));

      const expectedActions = [
        actions.importCansRequest(),
        actions.importCansFailure(error),
      ];

      try {
        await store.dispatch(actions.importCans(type, data));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Create Can', () => {
    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.addCanRequest()).toEqual({
        type: t.ADD_CAN_REQUEST,
      });
      expect(actions.addCanSuccess(dataAdd)).toEqual({
        type: t.ADD_CAN_SUCCESS,
        data: dataAdd,
      });
      expect(actions.addCanFailure(error)).toEqual({
        type: t.ADD_CAN_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();

      sandbox.stub(request, 'post').returns(Promise.resolve({ data: dataAdd }));

      const expectedActions = [
        actions.addCanRequest(),
        actions.addCanSuccess(dataAdd),
      ];

      await store.dispatch(actions.addCan(dataAdd));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'post').returns(Promise.reject(error));

      const expectedActions = [
        actions.addCanRequest(),
        actions.addCanFailure(error),
      ];

      try {
        await store.dispatch(actions.addCan(dataAdd));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Export Cans Aging', () => {
    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.exportCansAgingRequest()).toEqual({
        type: t.EXPORT_CANS_AGING_REQUEST,
      });
      expect(actions.exportCansAgingSuccess()).toEqual({
        type: t.EXPORT_CANS_AGING_SUCCESS,
      });
      expect(actions.exportCansAgingFailure(error)).toEqual({
        type: t.EXPORT_CANS_AGING_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data: dataReport }));

      const expectedActions = [
        actions.exportCansAgingRequest(),
        actions.exportCansAgingSuccess(),
      ];

      await store.dispatch(actions.exportCansAging(paramsReport));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][1]).toEqual({ params: paramsReport });
    });

    it('should send request even if no params', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data: dataReport }));

      const expectedActions = [
        actions.exportCansAgingRequest(),
        actions.exportCansAgingSuccess(),
      ];

      await store.dispatch(actions.exportCansAging());
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][1]).toEqual({ params: {} });
    });

    it('INV-420 should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.exportCansAgingRequest(),
        actions.exportCansAgingFailure(error),
      ];

      try {
        await store.dispatch(actions.exportCansAging(paramsReport));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Fetch cans action', () => {
    it('action creators should return correct object', () => {
      expect(actions.fetchCansRequest(dataFetch)).toEqual({
        type: t.FETCH_CANS_REQUEST,
        data: dataFetch,
      });

      expect(actions.fetchCansFailure(error)).toEqual({
        type: t.FETCH_CANS_FAILURE,
        error,
      });

      expect(actions.receiveCans(cans)).toEqual({
        type: t.RECEIVE_CANS,
        cans,
      });

      expect(actions.receiveFilteredCans(cans)).toEqual({
        type: t.RECEIVE_FILTERED_CANS,
        cans,
      });

      expect(actions.receiveFilteredCans()).toEqual({
        type: t.RECEIVE_FILTERED_CANS,
        cans: [],
      });

      expect(actions.receiveCans()).toEqual({
        type: t.RECEIVE_CANS,
        cans: [],
      });
    });

    it('should filter function works properly', () => {
      const cansFilteredBySize = actions.filterCans(
        [{ size: '12' }, { size: '30' }, { size: '999' }],
        {
          size: '12,30',
        },
      );

      expect(cansFilteredBySize).toEqual([{ size: '12' }, { size: '30' }]);

      const cansFilteredByStatus1 = actions.filterCans(
        [canRequiresMaintenance, canOutOfService, canHazardous],
        {
          isRequiredMaintenance: 1,
        },
      );

      const cansFilteredByStatus2 = actions.filterCans(
        [canRequiresMaintenance, canOutOfService, canHazardous],
        {
          isRequiredMaintenance: 1,
          isOutOfService: 1,
          hazardous: 1,
        },
      );

      const cansFilteredByStatus3 = actions.filterCans([simpleCan, simpleCan], {
        isRequiredMaintenance: 1,
        isOutOfService: 1,
        hazardous: 1,
      });

      const cansFilteredByStatus4 = actions.filterCans(
        [simpleCan, simpleCan],
        {},
      );

      expect(cansFilteredByStatus1).toEqual([canRequiresMaintenance]);

      expect(cansFilteredByStatus2).toEqual([
        canRequiresMaintenance,
        canOutOfService,
        canHazardous,
      ]);

      expect(cansFilteredByStatus3).toEqual([]);

      expect(cansFilteredByStatus4).toEqual([simpleCan, simpleCan]);
    });

    it(`should make request only when bounds, status, allowNullLocations,
          date or search were changed`, async () => {
      const store = mockStore({ cans: { list: [] } });
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data: cans }));

      await store.dispatch(actions.fetchCans({ bounds }));
      await store.dispatch(actions.fetchCans({ bounds }));
      expect(get.calledOnce).toBe(true);

      await store.dispatch(actions.fetchCans({ date }));
      await store.dispatch(actions.fetchCans({ date }));
      expect(get.calledTwice).toBe(true);

      await store.dispatch(actions.fetchCans({ search }));
      await store.dispatch(actions.fetchCans({ search }));
      expect(get.calledThrice).toBe(true);

      await store.dispatch(actions.fetchCans({ status }));
      await store.dispatch(actions.fetchCans({ status }));
      expect(get.callCount).toBe(4);

      await store.dispatch(actions.fetchCans({ allowNullLocations }));
      await store.dispatch(actions.fetchCans({ allowNullLocations }));
      expect(get.callCount).toBe(5);

      await store.dispatch(
        actions.fetchCans({ search, bounds, date, status, allowNullLocations }),
      );
      expect(get.callCount).toBe(6);

      await store.dispatch(
        actions.fetchCans({
          search: 'some another search',
          bounds: 'some another bounds',
          date: {
            startDate: '123',
            endDate: '123',
          },
        }),
      );
      expect(get.callCount).toBe(7);
    });

    it(`should filter cans on client side when bounds or
          date or search was not changed`, async () => {
      const list = [canRequiresMaintenance, canOutOfService, canHazardous];
      const filter = { isRequiredMaintenance: 1 };
      const store = mockStore({ cans: { list } });
      sandbox.stub(request, 'get').returns(Promise.resolve({ data: cans }));

      await store.dispatch(actions.fetchCans({}));
      await store.dispatch(actions.fetchCans(filter));

      expect(R.last(store.getActions())).toEqual(
        actions.receiveFilteredCans(actions.filterCans(list, filter)),
      );
    });

    it(`should make request only with bounds, date and search
          filter other filters should be skip`, async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data: cans }));

      await store.dispatch(
        actions.fetchCans({
          bounds,
          date,
          search,
          allowNullLocations,
          status,
          isRequiredMaintenance: 1,
          otherFilter: 0,
        }),
      );

      expect(get.calledOnce).toBe(true);
      expect(get.args[0][1].params).toEqual(
        actions.decorateFilter({
          bounds,
          search,
          date,
          allowNullLocations,
          status,
          withTransactions: 0,
        }),
      );
    });

    it(`should receive and filter cans on
          success request`, async () => {
      const store = mockStore();
      const cans = [canRequiresMaintenance, canOutOfService, canHazardous];
      const filter = {
        search: 'some search string',
        isRequiredMaintenance: 1,
      };
      sandbox.stub(request, 'get').returns(Promise.resolve({ data: cans }));
      const expectedActions = [
        actions.fetchCansRequest({ loading: true }),
        actions.receiveCans(cans),
        actions.receiveFilteredCans(actions.filterCans(cans, filter)),
      ];

      await store.dispatch(actions.fetchCans(filter));

      expect(store.getActions()).toEqual(expectedActions);
    });

    it(`should not make fail action if
          request was canceled`, async () => {
      const store = mockStore();
      const error = new Error('Cancelation');
      error.__CANCEL__ = true;
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      await store.dispatch(actions.fetchCans());

      expect(store.getActions()).toEqual([
        actions.fetchCansRequest({ loading: true }),
      ]);
    });

    it('should make fail action on bad request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchCansRequest({ loading: true }),
        actions.fetchCansFailure(error),
      ];

      try {
        await store.dispatch(
          actions.fetchCans(
            {
              search: 'please, find me some good wo',
            },
            false,
          ),
        );
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Dropoff Can', () => {
    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.dropOffCanRequest()).toEqual({
        type: t.DROPOFF_CAN_REQUEST,
      });
      expect(actions.dropOffCanSuccess(singleData)).toEqual({
        type: t.DROPOFF_CAN_SUCCESS,
        data: singleData,
      });
      expect(actions.dropOffCanFailure(error)).toEqual({
        type: t.DROPOFF_CAN_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();

      sandbox
        .stub(request, 'put')
        .returns(Promise.resolve({ data: singleData }));

      const expectedActions = [
        actions.dropOffCanRequest(),
        actions.dropOffCanSuccess(singleData),
      ];

      await store.dispatch(actions.dropOffCan(singleId, singleLocation));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'put').returns(Promise.reject(error));

      const expectedActions = [
        actions.dropOffCanRequest(),
        actions.dropOffCanFailure(error),
      ];

      try {
        await store.dispatch(actions.dropOffCan(singleId, singleLocation));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Move Can', () => {
    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.moveCanRequest()).toEqual({
        type: t.MOVE_CAN_REQUEST,
      });
      expect(actions.moveCanSuccess()).toEqual({
        type: t.MOVE_CAN_SUCCESS,
      });
      expect(actions.moveCanFailure(error)).toEqual({
        type: t.MOVE_CAN_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();

      sandbox
        .stub(request, 'put')
        .returns(Promise.resolve({ data: singleData }));

      const expectedActions = [
        actions.moveCanRequest(),
        actions.moveCanSuccess(singleData),
      ];

      await store.dispatch(actions.moveCan(singleId, singleLocation));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'put').returns(Promise.reject(error));

      const expectedActions = [
        actions.moveCanRequest(),
        actions.moveCanFailure(error),
      ];

      try {
        await store.dispatch(actions.moveCan(singleId, singleLocation));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Pickup Can', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.pickUpCanRequest()).toEqual({
        type: t.PICKUP_CAN_REQUEST,
      });
      expect(actions.pickUpCanSuccess(singleData)).toEqual({
        type: t.PICKUP_CAN_SUCCESS,
        data: singleData,
      });
      expect(actions.pickUpCanFailure(error)).toEqual({
        type: t.PICKUP_CAN_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();

      sandbox
        .stub(request, 'put')
        .returns(Promise.resolve({ data: singleData }));

      const expectedActions = [
        actions.pickUpCanRequest(),
        actions.pickUpCanSuccess(singleData),
      ];

      await store.dispatch(actions.pickUpCan(singleId, singleTruck));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'put').returns(Promise.reject(error));

      const expectedActions = [
        actions.pickUpCanRequest(),
        actions.pickUpCanFailure(error),
      ];

      try {
        await store.dispatch(actions.pickUpCan(singleId, singleTruck));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Transfer Can', () => {
    it('should return correct action object', () => {
      const error = 'Test message';
      expect(actions.transferCanRequest()).toEqual({
        type: t.TRANSFER_CAN_REQUEST,
      });
      expect(actions.transferCanSuccess(data)).toEqual({
        type: t.TRANSFER_CAN_SUCCESS,
        data,
      });
      expect(actions.transferCanFailure(error)).toEqual({
        type: t.TRANSFER_CAN_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();

      sandbox
        .stub(request, 'put')
        .returns(Promise.resolve({ data: singleData }));

      const expectedActions = [
        actions.transferCanRequest(),
        actions.transferCanSuccess(singleData),
      ];

      await store.dispatch(actions.transferCan(singleId, singleTruck));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'put').returns(Promise.reject(error));

      const expectedActions = [
        actions.transferCanRequest(),
        actions.transferCanFailure(error),
      ];

      try {
        await store.dispatch(actions.transferCan(singleId, singleTruck));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
});
