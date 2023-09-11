import * as t from './actionTypes';

import smanifest from './reducer';

const initialState = {
  customersById: {},
  customerIds: [],
  facilitiesById: {},
  facilityIds: [],
  byId: {},
  ids: [],
  isLoading: false,
  errorMessage: null,
  enabled: false,
};

describe('Structured Manifest reducer', () => {
  it('should have initial state', () => {
    const state = smanifest(undefined, {});
    expect(state).toEqual(initialState);
  });
  it('should handle CREATE_CUSTOMER_REQUEST', () => {
    expect(
      smanifest(initialState, {
        type: t.CREATE_CUSTOMER_REQUEST,
      }),
    ).toEqual({
      customersById: {},
      customerIds: [],
      facilitiesById: {},
      facilityIds: [],
      byId: {},
      ids: [],
      isLoading: true,
      errorMessage: null,
      enabled: false,
    });
  });
  it('should handle CREATE_FACILITY_REQUEST', () => {
    expect(
      smanifest(initialState, {
        type: t.CREATE_FACILITY_REQUEST,
      }),
    ).toEqual({
      customersById: {},
      customerIds: [],
      facilitiesById: {},
      facilityIds: [],
      byId: {},
      ids: [],
      isLoading: true,
      errorMessage: null,
      enabled: false,
    });
  });
  it('should handle FETCH_CUSTOMERS_REQUEST', () => {
    expect(
      smanifest(initialState, {
        type: t.FETCH_CUSTOMERS_REQUEST,
      }),
    ).toEqual({
      customersById: {},
      customerIds: [],
      facilitiesById: {},
      facilityIds: [],
      byId: {},
      ids: [],
      isLoading: true,
      errorMessage: null,
      enabled: false,
    });
  });
  it('should handle FETCH_FACILITIES_REQUEST', () => {
    expect(
      smanifest(initialState, {
        type: t.FETCH_FACILITIES_REQUEST,
      }),
    ).toEqual({
      customersById: {},
      customerIds: [],
      facilitiesById: {},
      facilityIds: [],
      byId: {},
      ids: [],
      isLoading: true,
      errorMessage: null,
      enabled: false,
    });
  });
  it('should handle FETCH_ORG_CONFIG_REQUEST', () => {
    expect(
      smanifest(initialState, {
        type: t.FETCH_ORG_CONFIG_REQUEST,
      }),
    ).toEqual({
      customersById: {},
      customerIds: [],
      facilitiesById: {},
      facilityIds: [],
      byId: {},
      ids: [],
      isLoading: true,
      errorMessage: null,
      enabled: false,
    });
  });
  it('should handle FETCH_S_MANIFESTS_REQUEST', () => {
    expect(
      smanifest(initialState, {
        type: t.FETCH_S_MANIFESTS_REQUEST,
      }),
    ).toEqual({
      customersById: {},
      customerIds: [],
      facilitiesById: {},
      facilityIds: [],
      byId: {},
      ids: [],
      isLoading: true,
      errorMessage: null,
      enabled: false,
    });
  });
  it('should handle FETCH_ORG_CONFIG_SUCCESS', () => {
    expect(
      smanifest(initialState, {
        type: t.FETCH_ORG_CONFIG_SUCCESS,
        payload: {
          enableStructuredManifest: true,
        },
      }),
    ).toEqual({
      customersById: {},
      customerIds: [],
      facilitiesById: {},
      facilityIds: [],
      byId: {},
      ids: [],
      isLoading: false,
      errorMessage: null,
      enabled: true,
    });
  });
  it('should handle FETCH_CUSTOMERS_SUCCESS', () => {
    const fetchedCustomers = [
      { id: 1, name: 'test' },
      { id: 2, name: 'mest' },
    ];

    expect(
      smanifest(initialState, {
        type: t.FETCH_CUSTOMERS_SUCCESS,
        payload: fetchedCustomers,
      }),
    ).toEqual({
      customersById: { 1: { id: 1, name: 'test' }, 2: { id: 2, name: 'mest' } },
      customerIds: [1, 2],
      facilitiesById: {},
      facilityIds: [],
      byId: {},
      ids: [],
      isLoading: false,
      errorMessage: null,
      enabled: false,
    });
  });
  it('should handle FETCH_FACILITIES_SUCCESS', () => {
    const fetchedFacilities = [
      { id: 1, name: 'landfill' },
      { id: 2, name: 'recycle' },
    ];

    expect(
      smanifest(initialState, {
        type: t.FETCH_FACILITIES_SUCCESS,
        payload: fetchedFacilities,
      }),
    ).toEqual({
      customersById: {},
      customerIds: [],
      facilitiesById: {
        1: { id: 1, name: 'landfill' },
        2: { id: 2, name: 'recycle' },
      },
      facilityIds: [1, 2],
      byId: {},
      ids: [],
      isLoading: false,
      errorMessage: null,
      enabled: false,
    });
  });
  it('should handle FETCH_S_MANIFESTS_SUCCESS', () => {
    const fetchedManifests = [
      { id: 1, authRep: 'james' },
      { id: 2, authRep: 'john' },
    ];

    expect(
      smanifest(initialState, {
        type: t.FETCH_S_MANIFESTS_SUCCESS,
        payload: fetchedManifests,
      }),
    ).toEqual({
      customersById: {},
      customerIds: [],
      facilitiesById: {},
      facilityIds: [],
      byId: {
        1: { id: 1, authRep: 'james' },
        2: { id: 2, authRep: 'john' },
      },
      ids: [1, 2],
      isLoading: false,
      errorMessage: null,
      enabled: false,
    });
  });
});
