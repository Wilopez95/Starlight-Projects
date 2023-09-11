import {
  fetchConstantsSuccess,
  fetchConstantsRequest,
  fetchConstantsFailure,
} from './actions';
import constants from './reducer';

const initialState = {
  isLoading: false,
  hasFetched: false,
  error: '',
  can: {
    action: {},
    size: [],
  },
  location: {
    type: {},
  },
  workOrder: {
    action: {},
    status: {},
    material: [],
    note: {
      transitionState: {},
    },
  },
  import: {
    type: {},
  },
};

describe('Constants reducer', () => {
  it('should have initial state', () => {
    const state = constants(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('should update to isLoading on fetchConstantsRequest', () => {
    const expectedState = {
      ...initialState,
      isLoading: true,
    };
    const state = constants(undefined, fetchConstantsRequest());

    expect(state).toEqual(expectedState);
  });

  it('should update state on fetchConstantsSuccess', () => {
    const fetchedConstants = { can: { size: [12, 30, 40] } };
    const expectedState = {
      ...initialState,
      hasFetched: true,
      can: { size: [12, 30, 40] },
    };
    const state = constants(undefined, fetchConstantsSuccess(fetchedConstants));

    expect(state).toEqual(expectedState);
  });
  it('should update to error on fetchConstantsFailure', () => {
    const expectedState = {
      ...initialState,
      error: 'test error',
    };
    const state = constants(undefined, fetchConstantsFailure('test error'));

    expect(state).toEqual(expectedState);
  });
});
