/* eslint-disable no-unused-vars */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import request from '../../../helpers/request';
import * as t from './actionTypes';
import * as actions from './actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const testSetting = [
  { key: 'map', value: { location: { location: { lat: 123, lon: 321 } } } },
];

describe('Settings Actions', () => {
  describe('Actions fetch setting', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.fetchSettingRequest()).toEqual({
        type: t.FETCH_SETTING_REQUEST,
      });
      expect(actions.receiveSetting(testSetting)).toEqual({
        type: t.RECEIVE_SETTING,
        data: testSetting,
      });
      expect(actions.fetchSettingFailure(error)).toEqual({
        type: t.FETCH_SETTING_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const params = { keys: 'map' };
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data: testSetting }));

      const expectedActions = [
        actions.fetchSettingRequest(),
        actions.receiveSetting(testSetting),
      ];

      await store.dispatch(actions.fetchSetting(params));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][1]).toEqual({ keys: params });
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchSettingRequest(),
        actions.fetchSettingFailure(error),
      ];

      try {
        await store.dispatch(actions.fetchSetting());
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });

    it('should return error on reject fetchSettingByKey request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchSettingRequest(),
        actions.fetchSettingFailure(error),
      ];

      try {
        await store.dispatch(actions.fetchSettingByKey('map'));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Actions update setting', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.updateSettingRequest()).toEqual({
        type: t.UPDATE_SETTING_REQUEST,
      });
      expect(actions.updateSettingSuccess(testSetting)).toEqual({
        type: t.UPDATE_SETTING_SUCCESS,
        data: testSetting,
      });
      expect(actions.updateSettingFailure(error)).toEqual({
        type: t.UPDATE_SETTING_FAILURE,
        error,
      });
    });

    // it('should send request', async () => {
    //   const store = mockStore();
    //   sandbox.stub(request, 'put').returns(Promise.resolve({ data }));

    //   const expectedActions = [
    //     actions.updateSettingRequest(),
    //     actions.updateSettingSuccess(...data),
    //   ];

    //   await store.dispatch(actions.updateSetting(data));
    //   expect(store.getActions()).toEqual(expectedActions);
    // });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'put').returns(Promise.reject(error));

      const expectedActions = [
        actions.updateSettingRequest(),
        actions.updateSettingFailure(error),
      ];

      try {
        await store.dispatch(actions.updateSetting());
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
});
