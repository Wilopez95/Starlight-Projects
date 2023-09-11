/* eslint-disable no-unused-vars */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import request from '../../../helpers/request';
import { material as materialSchema } from 'state/schema';
import * as t from './actionTypes';
import * as actions from './actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const data = { id: 1 };
const id = 1;

describe('Materials Actions', () => {
  describe('Create Material', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object for createMaterial', () => {
      const error = 'Test error';
      expect(actions.createMaterialRequest()).toEqual({
        type: t.CREATE_MATERIAL_REQUEST,
      });
      expect(actions.createMaterialSuccess(data)).toEqual({
        type: t.CREATE_MATERIAL_SUCCESS,
        payload: data,
        meta: {
          schema: materialSchema,
        },
      });
      expect(actions.createMaterialFailure(error)).toEqual({
        type: t.CREATE_MATERIAL_FAILURE,
        error,
      });
    });

    it('should produce CREATE_MATERIAL_SUCCESS after successfully adding a new material', async () => {
      const store = mockStore();

      sandbox.stub(request, 'post').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.createMaterialRequest(),
        actions.createMaterialSuccess(data),
      ];

      await store.dispatch(actions.createMaterial(data));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return CREATE_MATERIAL_FAILURE and an error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'post').returns(Promise.reject(error));

      const expectedActions = [
        actions.createMaterialRequest(),
        actions.createMaterialFailure(error),
      ];

      try {
        await store.dispatch(actions.createMaterial(data));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Fetch Material', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action objects for fetch material', () => {
      const error = 'Test error';
      expect(actions.fetchMaterialRequest()).toEqual({
        type: t.FETCH_MATERIAL_REQUEST,
      });
      expect(actions.fetchMaterialSuccess(data)).toEqual({
        type: t.FETCH_MATERIAL_SUCCESS,
        payload: data,
        meta: {
          schema: materialSchema,
        },
      });
      expect(actions.fetchMaterialFailure(error)).toEqual({
        type: t.FETCH_MATERIAL_FAILURE,
        error,
      });
    });

    it('should produce FETCH_MATERIAL_SUCCESS and fetch a material', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.fetchMaterialRequest(),
        actions.fetchMaterialSuccess(data),
      ];

      await store.dispatch(actions.fetchMaterial(data.id));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][0]).toBe(`materials`);
      expect(get.args[0][1]).toEqual({ params: { id: data.id } });
    });

    it('should return FETCH_MATERIAL_FAILURE and error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchMaterialRequest(),
        actions.fetchMaterialFailure(error),
      ];

      try {
        await store.dispatch(actions.fetchMaterial(1));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Fetch Materials', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object for fetching materials', () => {
      const error = 'Test error';
      expect(actions.fetchMaterialsRequest()).toEqual({
        type: t.FETCH_MATERIALS_REQUEST,
      });
      expect(actions.fetchMaterialsSuccess(data)).toEqual({
        type: t.FETCH_MATERIALS_SUCCESS,
        payload: data,
        meta: {
          schema: [materialSchema],
        },
      });
      expect(actions.fetchMaterialsFailure(error)).toEqual({
        type: t.FETCH_MATERIALS_FAILURE,
        error,
      });
    });

    it('should produce FETCH_MATERIALS_SUCCESS and fetch materials', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.fetchMaterialsRequest(),
        actions.fetchMaterialsSuccess(data),
      ];

      await store.dispatch(actions.fetchMaterials(data.id));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][0]).toBe(`materials`);
    });

    it('should return FETCH_MATERIALS_FAILURE and an error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchMaterialsRequest(),
        actions.fetchMaterialsFailure(error),
      ];

      try {
        await store.dispatch(actions.fetchMaterials(1));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
    // it('should not fetch materials if they already exist', async () => {
    //   const initalState = {
    //     materials: {
    //       isLoading: false,
    //       error: '',
    //       byId: { '1': { id: '1', name: 'Ice' } },
    //       ids: ['1'],
    //     },
    //   };
    //   const store = mockStore(initalState);

    //   const expectedActions = [];
    //   await store.dispatch(actions.fetchMaterialsIfNeeded());
    //   expect(store.getActions()).toEqual(expectedActions);
    // });
    // it('should only fetch materials if necessary using isLoading', async () => {
    //   const initalState = {
    //     materials: {
    //       isLoading: true,
    //       error: '',
    //       byId: { '1': { id: '1', name: 'Ice' } },
    //       ids: ['1'],
    //     },
    //   };
    //   const store = mockStore(initalState);
    //   sandbox.stub(request, 'get').returns(Promise.resolve({ data }));
    //   const expectedActions = [];
    //   await store.dispatch(actions.fetchMaterialsIfNeeded());
    //   expect(store.getActions()).toEqual(expectedActions);
    // });
    it('should only fetch materials if necessary', async () => {
      const initalState = {
        materials: {
          isLoading: false,
          error: '',
          byId: {},
          ids: [],
        },
      };
      const store = mockStore(initalState);

      sandbox.stub(request, 'get').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.fetchMaterialsRequest(),
        actions.fetchMaterialsSuccess(data),
      ];
      await store.dispatch(actions.fetchMaterialsIfNeeded());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
  describe('Remove Material', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.removeMaterialRequest()).toEqual({
        type: t.REMOVE_MATERIAL_REQUEST,
      });
      expect(actions.removeMaterialSuccess(id)).toEqual({
        type: t.REMOVE_MATERIAL_SUCCESS,
        id,
      });
      expect(actions.removeMaterialFailure(error)).toEqual({
        type: t.REMOVE_MATERIAL_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      const get = sandbox.stub(request, 'delete').returns(Promise.resolve());

      const expectedActions = [
        actions.removeMaterialRequest(),
        actions.removeMaterialSuccess(id),
      ];

      await store.dispatch(actions.removeMaterial(id));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][0]).toBe(`materials/${id}`);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'delete').returns(Promise.reject(error));

      const expectedActions = [
        actions.removeMaterialRequest(),
        actions.removeMaterialFailure(error),
      ];

      try {
        await store.dispatch(actions.removeMaterial(1));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Update Material', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.updateMaterialRequest()).toEqual({
        type: t.UPDATE_MATERIAL_REQUEST,
      });
      expect(actions.updateMaterialSuccess(data)).toEqual({
        type: t.UPDATE_MATERIAL_SUCCESS,
        payload: data,
        meta: {
          schema: materialSchema,
        },
      });
      expect(actions.updateMaterialFailure(error)).toEqual({
        type: t.UPDATE_MATERIAL_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'put')
        .returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.updateMaterialRequest(),
        actions.updateMaterialSuccess(data),
      ];

      await store.dispatch(actions.updateMaterial(id, data));
      expect(store.getActions()).toEqual(expectedActions);

      expect(get.args[0][0]).toBe(`materials/${id}`);
      expect(get.args[0][1]).toBe(data);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'put').returns(Promise.reject(error));

      const expectedActions = [
        actions.updateMaterialRequest(),
        actions.updateMaterialFailure(error),
      ];

      try {
        await store.dispatch(actions.updateMaterial(id, data));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
});
