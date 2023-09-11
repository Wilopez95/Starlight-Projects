import {
  fetchSizesRequest,
  fetchSizesSuccess,
  fetchSizesFailure,
  fetchSizeRequest,
  fetchSizeSuccess,
  fetchSizeFailure,
  removeSizeSuccess,
} from './actions';

import sizes from './reducer';

const initialState = {
  list: [],
  isLoading: false,
  error: null,
  current: {},
};

describe('Sizes reducer', () => {
  it('should have initial state', () => {
    const state = sizes(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('should fetch size', () => {
    const fetchedSize = { id: 123, name: 'testSize' };
    let state = sizes({ current: { id: 123, name: 'testSize' } }, {});
    state = sizes(state, fetchSizeSuccess(fetchedSize));

    expect(state.current).toEqual(fetchedSize);
    expect(state.isLoading).toBe(false);
  });

  it('should set FAILURE status and initial state on fetch size failure', () => {
    let state = sizes({ current: { id: 123, name: 'testSize' }, list: [] }, {});
    state = sizes(state, fetchSizeFailure('Network error'));

    expect(state).toEqual({
      ...initialState,
      error: 'Network error',
    });
  });

  it('should set loading state and clear prev size on fetch size', () => {
    let state = sizes({ current: 'testSize' }, {});
    state = sizes(state, fetchSizeRequest());

    expect(state.isLoading).toBe(true);
    expect(state.current).toEqual({});
  });

  it('Ishould fetch sizes', () => {
    const fetchedSizes = ['testSize1', 'testSize3'];
    let state = sizes({ list: ['testSize1', 'testSize2'] }, {});
    state = sizes(state, fetchSizesSuccess(fetchedSizes));

    expect(state.list).toEqual(fetchedSizes);
    expect(state.isLoading).toBe(false);
  });

  it('should set FAILURE status and initial state on fetch sizes failure', () => {
    let state = sizes({ current: {}, list: [] }, {});
    state = sizes(state, fetchSizesFailure('Network Error'));

    expect(state).toEqual({
      ...initialState,
      isLoading: false,
      current: {},
      list: [],
      error: 'Network Error',
    });
  });

  it('should set loading state on fetch sizes', () => {
    let state = sizes({ list: ['testSize1', 'testSize2'] }, {});
    state = sizes(state, fetchSizesRequest());

    expect(state.isLoading).toBe(true);
  });

  it('should remove deleted size from list', () => {
    const payload = [
      { name: 'testSize1', id: 1 },
      { name: 'testSize2', id: 2 },
    ];
    let state = sizes({ list: payload }, {});
    state = sizes(state, removeSizeSuccess(2));

    expect(state.list).toEqual([payload[0]]);
  });
});
