// Libs
import {
  fetchDriverRequest,
  fetchDriverFailure,
  fetchDriverSuccess,
  forgetDriver,
  updateDriverSuccess,
} from './actions';

// Reducer
import driver from './reducer';

const initialState = {
  status: 'UNTOUCHED',
  isLoading: false,
  data: null,
};

describe('Driver reducer', () => {
  it('should have initial state', () => {
    const state = driver(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('should update driver on receive action', () => {
    const fetchedDriver = { id: 123 };
    const state = driver(initialState, fetchDriverSuccess(fetchedDriver));

    expect(state.data).toEqual(fetchedDriver);
    expect(state.isLoading).toEqual(false);
  });

  it('should set loading state and clear prev can on request', () => {
    let state = driver({ data: 'testDriver' }, {});
    state = driver(state, fetchDriverRequest());

    expect(state.isLoading).toEqual(true);
    expect(state.data).toBeFalsy();
  });

  it('should reset state on failture fetch', () => {
    const error = 'Error';
    let state = driver({ data: 'testDriver' }, {});
    state = driver(state, fetchDriverFailure(error));

    expect(state.isLoading).toEqual(false);
    expect(state.data).toBeFalsy();
  });

  it('should forget driver', () => {
    const fetchedDriver = { id: 1, name: 'Fetched driver' };
    let state = driver(undefined, {});
    state = driver(state, fetchDriverSuccess(fetchedDriver));
    state = driver(state, forgetDriver());

    expect(state).toEqual(initialState);
  });

  it('should update driver', () => {
    const id = 1;
    const fetchedDriver = { id, name: 'Fetched driver' };
    const updatedDriver = { id, name: 'Updated driver' };
    let state = driver({ data: fetchedDriver }, {});
    state = driver(state, updateDriverSuccess(id, updatedDriver));

    expect(state.data).toEqual(updatedDriver);
  });
});
