import {
  addCanSuccess,
  filterChange,
  unsetActiveCan,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
  fetchCansRequest,
  receiveCans,
  receiveFilteredCans,
  removeCanSuccess,
  updateCanSuccess,
  fetchCanSuccess,
  fetchCanRequest,
} from './actions';
import cans from './reducer';

const testCan = { id: 123 };
const fetchedCans = [{ id: 1 }, { id: 2 }];
const fetchCansRequestLoading = {
  loading: true,
};
const initialState = {
  activeCan: false,
  isLoading: false,
  errorOnTransactionsFetch: false,
  current: {},
  list: [],
  filtered: [],
  filter: {
    date: {
      startDate: null,
      endDate: null,
    },
    bounds: null,
    search: null,
    status: null,
    isRequiredMaintenance: null,
    isOutOfService: null,
    hazardous: null,
    allowNullLocations: null,
    inUse: null,
  },
  refreshCans: false,
};

describe('Cans reducer', () => {
  it('should have initial state', () => {
    const state = cans(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('should toggle active can', () => {
    let state = cans(undefined, fetchTransactionsSuccess(testCan));
    expect(state.activeCan).toEqual(testCan);
    state = cans(state, unsetActiveCan());
    expect(state.activeCan).toBe(false);
  });

  it('should update filter', () => {
    const filter = { bounds: 123 };
    const state = cans(undefined, filterChange(filter));
    expect(state.filter).toEqual({ ...initialState.filter, ...filter });
  });

  it('should keep old cans if activeCan is set', () => {
    const can = {
      id: 1,
    };
    const can2 = {
      id: 2,
    };

    const cansPayload = [can];
    const cansPayload2 = [can, can2];

    const stateWithCans1 = cans(undefined, receiveCans(cansPayload));
    expect(stateWithCans1.list).toEqual(cansPayload);
    const stateWithCans2 = cans(stateWithCans1, receiveCans(cansPayload2));
    expect(stateWithCans2.list).toEqual(cansPayload2);

    const stateWithCan = cans(
      stateWithCans2,
      fetchTransactionsSuccess(cansPayload),
    );
    const stateWithCans = cans(stateWithCan, receiveCans(can));
    expect(stateWithCans.list).toEqual(cansPayload2);
  });

  it('should reset activeCan on filter change', () => {
    const can = {
      id: 1,
    };

    const state = cans(undefined, fetchTransactionsSuccess(can));
    expect(state.activeCan).toEqual(can);
    const newState = cans(undefined, filterChange());
    expect(newState.activeCan).toBe(false);
  });

  it('should add can', () => {
    const secondCan = { id: 321 };
    let state = cans(undefined, {});
    expect(state.list.length).toBe(0);

    state = cans(state, addCanSuccess(testCan));
    expect(state.list[0]).toEqual(testCan);

    state = cans(state, addCanSuccess(testCan));
    expect(state.list.length).toBe(1);
    expect(state.list[0]).toEqual(testCan);

    state = cans(state, addCanSuccess(secondCan));
    expect(state.list.length).toBe(2);
    expect(state.list[0]).toEqual(secondCan);
    expect(state.list[1]).toEqual(testCan);
  });

  it('should toggle loading state', () => {
    let state = cans(undefined, {});
    expect(state.isLoading).toBe(false);
    expect(state.activeCan).toBe(false);

    state = cans(state, fetchTransactionsSuccess(testCan));
    state = cans(state, fetchCansRequest(fetchCansRequestLoading));

    expect(state.isLoading).toBe(true);
    expect(state.activeCan).toEqual(testCan);
  });

  it('should replace cans on receive cans from server', () => {
    let state = cans(undefined, {});
    state = cans(state, addCanSuccess(testCan));
    expect(state.list.length).toBe(1);
    state = cans(state, fetchCansRequest(fetchCansRequestLoading));

    state = cans(state, receiveCans(fetchedCans));
    expect(state.list.length).toBe(fetchedCans.length);
    state = cans(state, receiveFilteredCans(fetchedCans));
    expect(state.isLoading).toBe(false);
  });

  it('should remove can', () => {
    let state = cans(undefined, receiveCans(fetchedCans));
    state = cans(state, removeCanSuccess(fetchedCans[0].id));
    expect(state.list.length).toBe(fetchedCans.length - 1);
    expect(state.list[0]).toEqual(fetchedCans[1]);
  });

  it('should update can', () => {
    const updatedCan = { ...fetchedCans[0], serial: 'test serial' };
    let state = cans(undefined, receiveCans(fetchedCans));
    state = cans(state, updateCanSuccess(updatedCan));
    expect(state.list.filter(item => item.id === updatedCan.id)[0]).toEqual(
      updatedCan,
    );
  });

  it('should set error state for transactions requests', () => {
    let state = cans(undefined, fetchTransactionsFailure());
    expect(state.errorOnTransactionsFetch).toBe(true);
    state = cans(state, fetchTransactionsSuccess(fetchedCans[0]));
    expect(state.errorOnTransactionsFetch).toBe(false);
    expect(state.activeCan).toEqual(fetchedCans[0]);
  });
  it('should add a fetched can to current', () => {
    const fetchedCan = { id: 123 };
    let state = cans({ current: 'testCan' }, {});
    state = cans(state, fetchCanSuccess(fetchedCan));

    expect(state.current).toEqual(fetchedCan);
    expect(state.isLoading).toBe(false);
  });

  it('should set isLoading state', () => {
    let state = cans({ current: {} }, {});
    state = cans(state, fetchCanRequest());

    expect(state.isLoading).toBe(true);
  });
});
