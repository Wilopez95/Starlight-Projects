/* eslint-disable no-unused-vars */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import request from '../../../helpers/request';
import { document as documentSchema } from 'state/schema';
import * as actions from './actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const data = { id: 1 };
const id = 1;

describe('Documents Actions', () => {
  describe('Fetch Documents', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object for fetching documents', () => {
      const error = 'Test error';
      expect(actions.fetchDocumentsReq()).toEqual({
        type: actions.FETCH_DOCUMENTS_REQUEST,
      });
      expect(actions.fetchDocumentsSuccess(data)).toEqual({
        type: actions.FETCH_DOCUMENTS_SUCCESS,
        payload: data,
        meta: {
          schema: [documentSchema],
        },
      });
      expect(actions.fetchDocumentsFailure(error)).toEqual({
        type: actions.FETCH_DOCUMENTS_FAILURE,
        error,
      });
    });

    it('should fetch documents', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.fetchDocumentsReq(),
        actions.fetchDocumentsSuccess(data),
      ];

      await store.dispatch(actions.fetchDocuments());
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][0]).toBe(`documents`);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchDocumentsReq(),
        actions.fetchDocumentsFailure(error),
      ];

      try {
        await store.dispatch(actions.fetchDocuments());
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
    // it('should not fetch documents if they already exist', async () => {
    //   const initalState = {
    //     documents: {
    //       isLoading: false,
    //       errorMessage: '',
    //       byId: { '1': { id: '1', name: 'Ice' } },
    //       ids: ['1'],
    //     },
    //   };
    //   const store = mockStore(initalState);

    //   const expectedActions = [];
    //   await store.dispatch(actions.fetchDocsIfNeeded());
    //   expect(store.getActions()).toEqual(expectedActions);
    // });
    // it('should only fetch documents if necessary using isLoading', async () => {
    //   const initalState = {
    //     documents: {
    //       isLoading: true,
    //       errorMessage: '',
    //       byId: { '1': { id: '1', name: 'Ice' } },
    //       ids: ['1'],
    //     },
    //   };
    //   const store = mockStore(initalState);
    //   sandbox.stub(request, 'get').returns(Promise.resolve({ data }));
    //   const expectedActions = [];
    //   await store.dispatch(actions.fetchDocsIfNeeded());
    //   expect(store.getActions()).toEqual(expectedActions);
    // });
    it('should only fetch documents if necessary', async () => {
      const initalState = {
        documents: {
          isLoading: false,
          errorMessage: '',
          byId: {},
          ids: [],
        },
      };
      const store = mockStore(initalState);

      sandbox.stub(request, 'get').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.fetchDocumentsReq(),
        actions.fetchDocumentsSuccess(data),
      ];
      await store.dispatch(actions.fetchDocsIfNeeded());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
