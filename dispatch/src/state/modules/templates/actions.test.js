/* eslint-disable no-unused-vars */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import request from '../../../helpers/request';
import { template as templateSchema } from 'state/schema';
import * as t from './actionTypes';
import * as actions from './actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const data = { id: 1, name: 'template' };
const id = 1;

describe('Templates Actions', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });
  describe('Create Template', () => {
    it('should return correct action object for createTemplate', () => {
      const error = 'Test error';
      expect(actions.createTemplateRequest()).toEqual({
        type: t.CREATE_TEMPLATE_REQUEST,
      });
      expect(actions.createTemplateSuccess(data)).toEqual({
        type: t.CREATE_TEMPLATE_SUCCESS,
        payload: data,
        meta: {
          schema: templateSchema,
        },
      });
      expect(actions.createTemplateFailure(error)).toEqual({
        type: t.CREATE_TEMPLATE_FAILURE,
        error,
      });
    });

    it('should produce CREATE_TEMPLATE_SUCCESS after successfully adding a new template', async () => {
      const store = mockStore();

      sandbox.stub(request, 'post').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.createTemplateRequest(),
        actions.createTemplateSuccess(data),
      ];

      await store.dispatch(actions.createTemplate(data));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return CREATE_TEMPLATE_FAILURE and an error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'post').returns(Promise.reject(error));

      const expectedActions = [
        actions.createTemplateRequest(),
        actions.createTemplateFailure(error),
      ];

      try {
        await store.dispatch(actions.createTemplate(data));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Fetch Template', () => {
    it('should return correct action objects for get template', () => {
      const error = 'Test error';
      expect(actions.getTemplateRequest()).toEqual({
        type: t.GET_TEMPLATE_REQUEST,
      });
      expect(actions.getTemplateSuccess(data)).toEqual({
        type: t.GET_TEMPLATE_SUCCESS,
        payload: data,
      });
      expect(actions.getTemplateFailure(error)).toEqual({
        type: t.GET_TEMPLATE_FAILURE,
        error,
      });
    });

    it('should produce GET_TEMPLATE_SUCCESS and fetch a template', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.getTemplateRequest(),
        actions.getTemplateSuccess(data),
      ];

      await store.dispatch(actions.getTemplate(data.id));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][0]).toBe(`templates/1`);
    });

    it('should return GET_TEMPLATE_FAILURE and error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.getTemplateRequest(),
        actions.getTemplateFailure(error),
      ];

      try {
        await store.dispatch(actions.getTemplate(1));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Fetch Templates', () => {
    it('should return correct action object for fetching templates', () => {
      const error = 'Test error';
      expect(actions.fetchTemplatesReq()).toEqual({
        type: t.FETCH_TEMPLATES_REQUEST,
      });
      expect(actions.fetchTemplatesSuccess(data)).toEqual({
        type: t.FETCH_TEMPLATES_SUCCESS,
        payload: data,
        meta: {
          schema: [templateSchema],
        },
      });
      expect(actions.fetchTemplatesFailure(error)).toEqual({
        type: t.FETCH_TEMPLATES_FAILURE,
        error,
      });
    });

    it('should produce FETCH_TEMPLATES_SUCCESS and fetch templates', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.fetchTemplatesReq(),
        actions.fetchTemplatesSuccess(data),
      ];

      await store.dispatch(actions.fetchTemplates());
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][0]).toBe(`templates`);
    });

    it('should return FETCH_TEMPLATES_FAILURE and an error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchTemplatesReq(),
        actions.fetchTemplatesFailure(error),
      ];

      try {
        await store.dispatch(actions.fetchTemplates());
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
    // it('should not fetch templates if they already exist', async () => {
    //   const initalState = {
    //     templates: {
    //       isLoading: false,
    //       error: '',
    //       byId: { '1': { id: '1', name: 'Ice' } },
    //       ids: ['1'],
    //     },
    //   };
    //   const store = mockStore(initalState);

    //   const expectedActions = [];
    //   await store.dispatch(actions.loadTemplates());
    //   expect(store.getActions()).toEqual(expectedActions);
    // });
    // it('should only fetch templates if necessary using isLoading', async () => {
    //   const initalState = {
    //     templates: {
    //       isLoading: true,
    //       error: '',
    //       byId: { '1': { id: '1', name: 'Ice' } },
    //       ids: ['1'],
    //     },
    //   };
    //   const store = mockStore(initalState);
    //   sandbox.stub(request, 'get').returns(Promise.resolve({ data }));
    //   const expectedActions = [];
    //   await store.dispatch(actions.loadTemplates());
    //   expect(store.getActions()).toEqual(expectedActions);
    // });
    // it('should only fetch templates if necessary', async () => {
    //   const initalState = {
    //     templates: {
    //       isLoading: false,
    //       error: '',
    //       byId: {},
    //       ids: [],
    //     },
    //   };
    //   const store = mockStore(initalState);

    //   sandbox.stub(request, 'get').returns(Promise.resolve({ data }));

    //   const expectedActions = [
    //     actions.fetchTemplatesReq(),
    //     actions.fetchTemplatesSuccess(data),
    //   ];
    //   await store.dispatch(actions.loadTemplates());
    //   expect(store.getActions()).toEqual(expectedActions);
    // });
  });
  describe('Delete Template', () => {
    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.deleteTemplateRequest()).toEqual({
        type: t.DELETE_TEMPLATE_REQUEST,
      });
      expect(actions.deleteTemplateSuccess(id)).toEqual({
        type: t.DELETE_TEMPLATE_SUCCESS,
        id,
      });
      expect(actions.deleteTemplateFailure(error)).toEqual({
        type: t.DELETE_TEMPLATE_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      const get = sandbox.stub(request, 'delete').returns(Promise.resolve());

      const expectedActions = [
        actions.deleteTemplateRequest(),
        actions.deleteTemplateSuccess(id),
      ];

      await store.dispatch(actions.deleteTemplate(id));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][0]).toBe(`templates/${id}`);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'delete').returns(Promise.reject(error));

      const expectedActions = [
        actions.deleteTemplateRequest(),
        actions.deleteTemplateFailure(error),
      ];

      try {
        await store.dispatch(actions.deleteTemplate(1));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Update Template', () => {
    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.updateTemplateRequest()).toEqual({
        type: t.UPDATE_TEMPLATE_REQUEST,
      });
      expect(actions.updateTemplateSuccess(data)).toEqual({
        type: t.UPDATE_TEMPLATE_SUCCESS,
        payload: data,
        meta: {
          schema: templateSchema,
        },
      });
      expect(actions.updateTemplateFailure(error)).toEqual({
        type: t.UPDATE_TEMPLATE_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'put')
        .returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.updateTemplateRequest(),
        actions.updateTemplateSuccess(data),
      ];

      await store.dispatch(actions.updateTemplate(id, data));
      expect(store.getActions()).toEqual(expectedActions);

      expect(get.args[0][0]).toBe(`templates/${id}`);
      expect(get.args[0][1]).toBe(data);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'put').returns(Promise.reject(error));

      const expectedActions = [
        actions.updateTemplateRequest(),
        actions.updateTemplateFailure(error),
      ];

      try {
        await store.dispatch(actions.updateTemplate(id, data));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
});
