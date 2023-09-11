import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import request from '../../../helpers/request';
import * as t from './actionTypes';
import * as actions from './actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const params = {
  driverId: ['4', '27'],
  workOrderTypes: ['DUMP & RETURN'],
  workOrderStatuses: ['COMPLETED'],
  dataRange: '1497387600000..1499979599999',
  reportType: 'byDay',
};
const driversData = [{ id: 1 }, { id: 2 }];

const data = { id: 1 };
describe('Drivers Actions', () => {
  describe('Actions export drivers for report', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.exportDriversRequest()).toEqual({
        type: t.EXPORT_DRIVERS_REQUEST,
      });
      expect(actions.exportDriversSuccess()).toEqual({
        type: t.EXPORT_DRIVERS_SUCCESS,
      });
      expect(actions.exportDriversFailure(error)).toEqual({
        type: t.EXPORT_DRIVERS_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.exportDriversRequest(),
        actions.exportDriversSuccess(),
      ];

      await store.dispatch(actions.exportDrivers(params));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][1]).toEqual({ params });
    });

    it('should send request even if no params', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.exportDriversRequest(),
        actions.exportDriversSuccess(),
      ];

      await store.dispatch(actions.exportDrivers());
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][1]).toEqual({ params: {} });
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.exportDriversRequest(),
        actions.exportDriversFailure(error),
      ];

      try {
        await store.dispatch(actions.exportDrivers(params));
        assert.fail();
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Update Drivers', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object for updateDriverLocations', () => {
      const error = 'Test error';
      expect(actions.updateDriverLocRequest()).toEqual({
        type: t.UPDATE_DRIVER_LOC_REQUEST,
      });
      expect(actions.updateDriverLocSuccess(driversData)).toEqual({
        type: t.UPDATE_DRIVER_LOC_SUCCESS,
        payload: driversData,
      });
      expect(actions.updateDriverLocsFailure(error)).toEqual({
        type: t.UPDATE_DRIVER_LOC_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data: driversData }));

      const expectedActions = [
        actions.updateDriverLocRequest(),
        actions.updateDriverLocSuccess(driversData),
      ];

      await store.dispatch(actions.updateDriverLocations());
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.updateDriverLocRequest(),
        actions.updateDriverLocsFailure(error),
      ];

      try {
        await store.dispatch(actions.updateDriverLocations());
        assert.fail();
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
});
