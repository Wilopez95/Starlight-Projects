import {
  fetchDocumentsReq,
  fetchDocumentsSuccess,
  fetchDocumentsFailure,
} from './actions';

import documents from './reducer';

const initialState = {
  byId: {},
  ids: [],
  isLoading: false,
  errorMessage: null,
};

describe('Documents reducer', () => {
  it('should be initialized with initial state', () => {
    const state = documents(undefined, {});
    expect(state).toEqual(initialState);
  });
  it('should set isLoading state on fetch documents request', () => {
    let state = documents(undefined, {});
    state = documents(state, fetchDocumentsReq());

    expect(state.isLoading).toBe(true);
  });

  it('should fetch documents and add to the store', () => {
    const fetchedDocuments = {
      result: [1, 2],
      entities: {
        documents: {
          1: {
            id: 1,
            name: 'test',
          },
          2: {
            id: 2,
            name: 'hello',
          },
        },
      },
    };
    let state = documents(undefined, {});
    state = documents(state, fetchDocumentsSuccess(fetchedDocuments));
    const expectedIds = [1, 2];
    const expectedById = {
      1: {
        id: 1,
        name: 'test',
      },
      2: {
        id: 2,
        name: 'hello',
      },
    };
    expect(state.ids).toEqual(expectedIds);
    expect(state.byId).toEqual(expectedById);
    expect(state.isLoading).toEqual(false);
  });

  it('should display an error on fetchDocumentsFailure', () => {
    let state = documents(undefined, {});
    state = documents(state, fetchDocumentsFailure('not found'));

    expect(state).toEqual({ ...initialState, errorMessage: 'not found' });
  });
});
