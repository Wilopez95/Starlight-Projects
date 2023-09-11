/* eslint-disable no-catch-shadow, babel/camelcase, camelcase, no-unused-vars */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import request from '../../../helpers/request';
import * as cloudinary from '../../../helpers/cloudinary';

import * as actions from './actions';
import * as t from './actionTypes';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const data = { name: 'Driver name' };
const dataFetch = { id: 1 };
const imageData = {
  data: {
    secure_url: 'v1498044180/12345',
    version: '1498044180',
  },
};

const id = 1;
describe('Driver Actions', () => {
  describe('Create Driver', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.createDriverRequest()).toEqual({
        type: t.CREATE_DRIVER_REQUEST,
      });
      expect(actions.createDriverSuccess(data)).toEqual({
        type: t.CREATE_DRIVER_SUCCESS,
        data,
      });
      expect(actions.createDriverFailure(error)).toEqual({
        type: t.CREATE_DRIVER_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();

      sandbox.stub(request, 'post').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.createDriverRequest(),
        actions.createDriverSuccess(data),
      ];

      await store.dispatch(actions.createDriver(data));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'post').returns(Promise.reject(error));

      const expectedActions = [
        actions.createDriverRequest(),
        actions.createDriverFailure(error),
      ];

      try {
        await store.dispatch(actions.createDriver(data));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });

    it('should save correct image url', async () => {
      const store = mockStore();
      const imageUrl = imageData.data.secure_url.replace(
        `v${imageData.data.version}/`,
        '',
      );
      const data = {
        photo: imageUrl,
      };
      const expectedActions = [
        actions.createDriverRequest(),
        actions.createDriverSuccess(data),
      ];

      sandbox.stub(cloudinary, 'upload').returns(Promise.resolve(imageData));
      sandbox.stub(request, 'post').returns(Promise.resolve({ data }));

      await store.dispatch(actions.createDriver(data));
      expect(store.getActions()).toEqual(expectedActions);
      expect(request.post.args[0][1]).toEqual(data);
    });
  });

  describe('Update Driver', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.updateDriverRequest()).toEqual({
        type: t.UPDATE_DRIVER_REQUEST,
      });
      expect(actions.updateDriverSuccess(id, data)).toEqual({
        type: t.UPDATE_DRIVER_SUCCESS,
        id,
        data,
      });
      expect(actions.updateDriverFailure(error)).toEqual({
        type: t.UPDATE_DRIVER_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();

      sandbox.stub(request, 'put').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.updateDriverRequest(),
        actions.updateDriverSuccess(id, data),
      ];

      await store.dispatch(actions.updateDriver(id, data));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'put').returns(Promise.reject(error));

      const expectedActions = [
        actions.updateDriverRequest(),
        actions.updateDriverFailure(error),
      ];

      try {
        await store.dispatch(actions.updateDriver(id, data));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });

    it('should save correct driver photo url', async () => {
      const store = mockStore();
      const imageUrl = imageData.data.secure_url.replace(
        `v${imageData.data.version}/`,
        '',
      );
      const data = {
        photo: imageUrl,
      };
      const expectedActions = [
        actions.updateDriverRequest(),
        actions.updateDriverSuccess(id, data),
      ];

      sandbox.stub(cloudinary, 'upload').returns(Promise.resolve(imageData));
      sandbox.stub(request, 'put').returns(Promise.resolve({ data }));

      await store.dispatch(actions.updateDriver(id, data));
      expect(store.getActions()).toEqual(expectedActions);
      expect(request.put.args[0][1]).toEqual(data);
    });
  });

  describe('Fetch Driver', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.fetchDriverRequest()).toEqual({
        type: t.FETCH_DRIVER_REQUEST,
      });
      expect(actions.fetchDriverSuccess(dataFetch)).toEqual({
        type: t.FETCH_DRIVER_SUCCESS,
        data: dataFetch,
      });
      expect(actions.fetchDriverFailure(error)).toEqual({
        type: t.FETCH_DRIVER_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data: dataFetch }));

      const expectedActions = [
        actions.fetchDriverRequest(),
        actions.fetchDriverSuccess(dataFetch),
      ];

      await store.dispatch(actions.fetchDriver(dataFetch.id));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][0]).toBe(`drivers/${dataFetch.id}`);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchDriverRequest(),
        actions.fetchDriverFailure(error),
      ];

      try {
        await store.dispatch(actions.fetchDriver(1));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Remove Driver', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.removeDriverRequest()).toEqual({
        type: t.REMOVE_DRIVER_REQUEST,
      });
      expect(actions.removeDriverSuccess(id)).toEqual({
        type: t.REMOVE_DRIVER_SUCCESS,
        id,
      });
      expect(actions.removeDriverFailure(error)).toEqual({
        type: t.REMOVE_DRIVER_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();

      sandbox.stub(request, 'delete').returns(Promise.resolve());

      const expectedActions = [
        actions.removeDriverRequest(),
        actions.removeDriverSuccess(id),
      ];

      await store.dispatch(actions.removeDriver(id));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'delete').returns(Promise.reject(error));

      const expectedActions = [
        actions.removeDriverRequest(),
        actions.removeDriverFailure(error),
      ];

      try {
        await store.dispatch(actions.removeDriver(id));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
});
