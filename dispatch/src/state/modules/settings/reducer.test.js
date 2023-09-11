import {
  fetchSettingRequest,
  fetchSettingFailure,
  receiveSetting,
  updateSettingRequest,
  // updateSettingSuccess,
  updateSettingFailure,
} from './actions';

import setting from './reducer';

const initialState = {
  fetchStatus: 'UNTOUCHED',
  updateStatus: 'UNTOUCHED',
  isLoading: false,
  driver: {},
  map: {
    lat: 39.7621969,
    lon: -104.9749398,
    zoom: 10,
  },
  data: null,
  error: null,
};

describe('Setting reducer', () => {
  it('should have initial state', () => {
    const state = setting(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('should set loading fetchStatus and nullify updateStatus on request', () => {
    const state = setting(undefined, fetchSettingRequest());
    expect(state).toEqual({
      fetchStatus: 'LOADING',
      updateStatus: 'NONE',
      isLoading: true,
      data: null,
      error: null,
      driver: {},
      map: {
        lat: 39.7621969,
        lon: -104.9749398,
        zoom: 10,
      },
    });
  });

  it('should set success fetchStatus on success request', () => {
    const state = setting(undefined, receiveSetting());

    expect(state).toEqual({
      fetchStatus: 'DONE',
      updateStatus: 'UNTOUCHED',
      isLoading: false,
      data: [],
      error: null,
      driver: {},
      map: {
        lat: 39.7621969,
        lon: -104.9749398,
        zoom: 10,
      },
    });
  });

  it('should set FAILURE fetchStatus on request`s error', () => {
    const state = setting(undefined, fetchSettingFailure('oh no'));

    expect(state).toEqual({
      fetchStatus: 'FAILURE',
      updateStatus: 'UNTOUCHED',
      isLoading: false,
      data: null,
      error: 'oh no',
      driver: {},
      map: {
        lat: 39.7621969,
        lon: -104.9749398,
        zoom: 10,
      },
    });
  });

  it('should add settings to state on receive', () => {
    const settings = [{ key: 'map', value: {} }];
    const state = setting(undefined, receiveSetting(settings));

    expect(state).toEqual({
      fetchStatus: 'DONE',
      updateStatus: 'UNTOUCHED',
      isLoading: false,
      data: settings,
      error: null,
      driver: {},
      map: {
        lat: 39.7621969,
        lon: -104.9749398,
        zoom: 10,
      },
    });
  });

  it('should set loading updateStatus on request', () => {
    const state = setting(undefined, updateSettingRequest());
    expect(state).toEqual({
      fetchStatus: 'UNTOUCHED',
      updateStatus: 'UPDATING',
      isLoading: true,
      data: null,
      error: null,
      driver: {},
      map: {
        lat: 39.7621969,
        lon: -104.9749398,
        zoom: 10,
      },
    });
  });

  // it('should set success updateStatus on success request', () => {
  //   const state = setting(undefined, updateSettingSuccess([]));

  //   expect(state).toEqual({
  //     fetchStatus: 'UNTOUCHED',
  //     updateStatus: 'DONE',
  //     isLoading: false,
  //     data: {},
  //     error: null,
  //     driver: {},
  //     map: {},
  //   });
  // });

  it('should set FAILURE updateStatus on request`s error', () => {
    const state = setting(undefined, updateSettingFailure('oh no'));

    expect(state).toEqual({
      fetchStatus: 'UNTOUCHED',
      updateStatus: 'FAILURE',
      isLoading: false,
      data: null,
      error: 'oh no',
      driver: {},
      map: {
        lat: 39.7621969,
        lon: -104.9749398,
        zoom: 10,
      },
    });
  });
});
