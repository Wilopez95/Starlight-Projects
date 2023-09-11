/* eslint-disable no-catch-shadow, no-unused-vars */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import request from '../../../helpers/request';
import * as t from './actionTypes';
import * as actions from './actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const data = { id: 1, name: 'some size' };
const id = 1;

describe('Size Actions', () => {
  describe('Create Size', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.createSizeRequest()).toEqual({
        type: t.CREATE_SIZE_REQUEST,
      });
      expect(actions.createSizeSuccess(data)).toEqual({
        type: t.CREATE_SIZE_SUCCESS,
        data,
      });
      expect(actions.createSizeFailure(error)).toEqual({
        type: t.CREATE_SIZE_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();

      sandbox.stub(request, 'post').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.createSizeRequest(),
        actions.createSizeSuccess(data),
      ];

      await store.dispatch(actions.createSize(data));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'post').returns(Promise.reject(error));

      const expectedActions = [
        actions.createSizeRequest(),
        actions.createSizeFailure(error),
      ];

      try {
        await store.dispatch(actions.createSize(data));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Update Size', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.updateSizeRequest()).toEqual({
        type: t.UPDATE_SIZE_REQUEST,
      });
      expect(actions.updateSizeSuccess(data)).toEqual({
        type: t.UPDATE_SIZE_SUCCESS,
        payload: data,
      });
      expect(actions.updateSizeFailure(error)).toEqual({
        type: t.UPDATE_SIZE_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'put')
        .returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.updateSizeRequest(),
        actions.updateSizeSuccess(data),
      ];

      await store.dispatch(actions.updateSize(id, data));
      expect(store.getActions()).toEqual(expectedActions);

      expect(get.args[0][0]).toBe(`sizes/${id}`);
      expect(get.args[0][1]).toBe(data);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'put').returns(Promise.reject(error));

      const expectedActions = [
        actions.updateSizeRequest(),
        actions.updateSizeFailure(error),
      ];

      try {
        await store.dispatch(actions.updateSize(id, data));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Fetch Sizes', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.fetchSizesRequest()).toEqual({
        type: t.FETCH_SIZES_REQUEST,
      });
      expect(actions.fetchSizesSuccess(data)).toEqual({
        type: t.FETCH_SIZES_SUCCESS,
        sizes: data,
      });
      expect(actions.fetchSizesFailure(error)).toEqual({
        type: t.FETCH_SIZES_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.fetchSizesRequest(),
        actions.fetchSizesSuccess(data),
      ];

      await store.dispatch(actions.fetchSizes(data.id));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][0]).toBe(`sizes`);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchSizesRequest(),
        actions.fetchSizesFailure(error),
      ];

      try {
        await store.dispatch(actions.fetchSizes(1));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Fetch Size', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.fetchSizeRequest()).toEqual({
        type: t.FETCH_SIZE_REQUEST,
      });
      expect(actions.fetchSizeSuccess(data)).toEqual({
        type: t.FETCH_SIZE_SUCCESS,
        size: data,
      });
      expect(actions.fetchSizeFailure(error)).toEqual({
        type: t.FETCH_SIZE_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.fetchSizeRequest(),
        actions.fetchSizeSuccess(data),
      ];

      await store.dispatch(actions.fetchSize(data.id));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][0]).toBe(`sizes/${data.id}`);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchSizeRequest(),
        actions.fetchSizeFailure(error),
      ];

      try {
        await store.dispatch(actions.fetchSize(1));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Remove Size', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.removeSizeRequest()).toEqual({
        type: t.REMOVE_SIZE_REQUEST,
      });
      expect(actions.removeSizeSuccess(id)).toEqual({
        type: t.REMOVE_SIZE_SUCCESS,
        id,
      });
      expect(actions.removeSizeFailure(error)).toEqual({
        type: t.REMOVE_SIZE_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      const get = sandbox.stub(request, 'delete').returns(Promise.resolve());

      const expectedActions = [
        actions.removeSizeRequest(),
        actions.removeSizeSuccess(id),
      ];

      await store.dispatch(actions.removeSize(id));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][0]).toBe(`sizes/${id}`);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'delete').returns(Promise.reject(error));

      const expectedActions = [
        actions.removeSizeRequest(),
        actions.removeSizeFailure(error),
      ];

      try {
        await store.dispatch(actions.removeSize(1));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
});
