import {
  fetchTemplatesReq,
  fetchTemplatesSuccess,
  fetchTemplatesFailure,
} from './actions';

import templates from './reducer';

const initialState = {
  byId: {},
  ids: [],
  isLoading: false,
  errorMessage: null,
  logo: {},
  current: {},
};

describe('Templates reducer', () => {
  it('should be initialized with initial state', () => {
    const state = templates(undefined, {});
    expect(state).toEqual(initialState);
  });
  it('should set isLoading state on fetch templates request', () => {
    let state = templates(undefined, {});
    state = templates(state, fetchTemplatesReq());

    expect(state.isLoading).toBe(true);
  });

  it('should fetch templates and add to the store', () => {
    const fetchedTemplates = {
      result: [1, 2],
      entities: {
        templates: {
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
    let state = templates(undefined, {});
    state = templates(state, fetchTemplatesSuccess(fetchedTemplates));
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

  it('should display an error on fetchTemplatesFailure', () => {
    let state = templates(undefined, {});
    state = templates(state, fetchTemplatesFailure('not found'));

    expect(state).toEqual({ ...initialState, errorMessage: 'not found' });
  });
});
