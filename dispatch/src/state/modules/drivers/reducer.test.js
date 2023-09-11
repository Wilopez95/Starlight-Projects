import {
  fetchDriversRequest,
  fetchDriversSuccess,
  fetchDriversFailure,
  receiveDrivers,
  removeAddedDriver,
  addDriver,
  updateDriverLocSuccess,
} from './actions';
import drivers from './reducer';

const initialState = {
  status: 'UNTOUCHED',
  list: [],
  ids: [],
  filtered: [],
  added: [],
  unadded: [],
};

describe('Drivers reducer', () => {
  it('should have initial state', () => {
    const state = drivers(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('should set loading state on request', () => {
    const state = drivers(undefined, fetchDriversRequest());

    expect(state).toEqual({ ...state, status: 'LOADING' });
  });

  it('should set success state on success request', () => {
    const state = drivers(undefined, fetchDriversSuccess());

    expect(state).toEqual({ ...state, status: 'SUCCESS' });
  });

  it('should set FAILURE state on request`s error', () => {
    const state = drivers(undefined, fetchDriversFailure());

    expect(state).toEqual({ ...state, status: 'FAILURE' });
  });

  it('should add drivers to state on receive', () => {
    const payload = [
      { id: 1, name: 'test', color: '#63b598' },
      { id: 2, name: 'test', color: '#ea9e70' },
    ];
    const state = drivers(undefined, receiveDrivers(payload));

    expect(state).toEqual({
      ...state,
      status: 'DONE',
      list: payload,
      filtered: payload,
    });
  });

  it('should add and remove driver from list', () => {
    const payload = [
      { id: 1, name: 'test', color: '#63b598' },
      { id: 2, name: 'test', color: '#ea9e70' },
    ];
    let state = drivers(undefined, receiveDrivers(payload));
    expect(state.list).toHaveLength(2);
    expect(state.added).toHaveLength(0);

    const payload2 = { id: 1, name: 'test' };
    state = drivers(state, addDriver(payload2));
    expect(state.added).toHaveLength(1);

    state = drivers(state, removeAddedDriver(payload2));
    expect(state.added).toHaveLength(0);
  });
  it('should update the added drivers on @drivers/UPDATE_DRIVER_LOC_SUCCESS', () => {
    const driversPayload = [
      {
        id: 1,
        name: 'joe',
        truckImage: 'blue',
        truck: {
          name: '404',
          location: {
            lat: 39.73915,
            lon: -104.9847,
          },
        },
      },
      {
        id: 3,
        name: 'bob',
        truckImage: 'red',
        truck: {
          name: '500',
          location: {
            lat: 40.73915,
            lon: -105.0202,
          },
        },
      },
      {
        id: 2,
        name: 'jake',
        truckImage: 'green',
        truck: {
          name: '400',
          location: {
            lat: 40.73915,
            lon: -105.0202,
          },
        },
      },
    ];

    const initialState = {
      status: 'UNTOUCHED',
      list: [],
      ids: [],
      added: [
        {
          id: 1,
          name: 'joe',
          truckImage: 'blue',
          truck: {
            name: '404',
            location: {
              lat: 39.0,
              lon: -104.0,
            },
          },
        },
        {
          id: 3,
          name: 'bob',
          truckImage: 'red',
          truck: {
            name: '500',
            location: {
              lat: 40.0,
              lon: -105.0,
            },
          },
        },
      ],
      unadded: [],
      filtered: [],
    };

    const state = drivers(initialState, updateDriverLocSuccess(driversPayload));

    expect(state).toEqual({
      added: [
        {
          id: 3,
          name: 'bob',
          truckImage: 'red',
          truck: {
            name: '500',
            location: {
              lat: 40.73915,
              lon: -105.0202,
            },
          },
        },
        {
          id: 1,
          name: 'joe',
          truckImage: 'blue',
          truck: {
            name: '404',
            location: {
              lat: 39.73915,
              lon: -104.9847,
            },
          },
        },
      ],
      list: [],
      filtered: [],
      unadded: [],
      ids: [],
      status: 'DONE',
    });
  });
});
