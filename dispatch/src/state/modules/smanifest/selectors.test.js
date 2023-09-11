import {
  getSmanifest,
  getManifestCustomerIds,
  getFacilityIds,
  getManifestIds,
  createSManifestEnabled,
  createSelectSManifestLoading,
  manifestCustomersById,
  facilitiesById,
  manifestsById,
  selectManifests,
  selectManifestFacilities,
  selectManifestCustomers,
} from './selectors';

describe('SManifest Selectors', () => {
  test('getSmanifest -- should select the smanifest state', () => {
    const smannifestState = {
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
    const mockedState = {
      smanifest: smannifestState,
    };
    expect(getSmanifest(mockedState)).toEqual(smannifestState);
  });
  test('getManifestCustomerIds -- should select the manifest customer ids state', () => {
    const idsState = ['1'];
    const mockedState = {
      smanifest: {
        customersById: {},
        customerIds: ['1'],
        facilitiesById: {},
        facilityIds: [],
        byId: {},
        ids: [],
        isLoading: false,
        errorMessage: null,
        enabled: false,
      },
    };
    expect(getManifestCustomerIds(mockedState)).toEqual(idsState);
  });
  test('manifestCustomersById -- should select the manifest customer byId state', () => {
    const byIdState = {
      1: {
        id: '1',
      },
    };
    const mockedState = {
      smanifest: {
        customersById: {
          1: {
            id: '1',
          },
        },
        customerIds: ['1'],
        facilitiesById: {},
        facilityIds: [],
        byId: {},
        ids: [],
        isLoading: false,
        errorMessage: null,
        enabled: false,
      },
    };
    expect(manifestCustomersById(mockedState)).toEqual(byIdState);
  });
  test('facilitiesById -- should select the manifest facility byId state', () => {
    const byIdState = {
      1: {
        id: '1',
      },
    };
    const mockedState = {
      smanifest: {
        customersById: {},
        customerIds: [],
        facilitiesById: {
          1: {
            id: '1',
          },
        },
        facilityIds: ['1'],
        byId: {},
        ids: [],
        isLoading: false,
        errorMessage: null,
        enabled: false,
      },
    };
    expect(facilitiesById(mockedState)).toEqual(byIdState);
  });
  test('getFacilityIds -- should select the facility ids state', () => {
    const idsState = ['1'];
    const mockedState = {
      smanifest: {
        customersById: {},
        customerIds: [],
        facilitiesById: {},
        facilityIds: ['1'],
        byId: {},
        ids: [],
        isLoading: false,
        errorMessage: null,
        enabled: false,
      },
    };
    expect(getFacilityIds(mockedState)).toEqual(idsState);
  });
  test('manifestsById -- should select the manifest byId state', () => {
    const byIdState = {
      1: {
        id: '1',
      },
    };
    const mockedState = {
      smanifest: {
        customersById: {},
        customerIds: [],
        facilitiesById: {},
        facilityIds: [],
        byId: {
          1: {
            id: '1',
          },
        },
        ids: ['1'],
        isLoading: false,
        errorMessage: null,
        enabled: false,
      },
    };
    expect(manifestsById(mockedState)).toEqual(byIdState);
  });
  test('getManifestIds -- should select the manifest ids state', () => {
    const idsState = ['1'];
    const mockedState = {
      smanifest: {
        customersById: {},
        customerIds: [],
        facilitiesById: {},
        facilityIds: [],
        byId: {},
        ids: ['1'],
        isLoading: false,
        errorMessage: null,
        enabled: false,
      },
    };

    expect(getManifestIds(mockedState)).toEqual(idsState);
  });
  test('createSManifestEnabled -- should select the manifest enabled state', () => {
    const selectManifestEnabled = createSManifestEnabled();
    const mappedState = false;
    const mockedState = {
      smanifest: {
        customersById: {},
        customerIds: [],
        facilitiesById: {},
        facilityIds: [],
        byId: {},
        ids: ['1'],
        isLoading: false,
        errorMessage: null,
        enabled: false,
      },
    };
    expect(selectManifestEnabled(mockedState)).toEqual(mappedState);
  });
  test('createSelectSManifestLoading -- should select isLoading state', () => {
    const byIdState = false;
    const selectIsLoading = createSelectSManifestLoading();
    const mockedState = {
      smanifest: {
        customersById: {},
        customerIds: [],
        facilitiesById: {},
        facilityIds: [],
        byId: {},
        ids: ['1'],
        isLoading: false,
        errorMessage: null,
        enabled: false,
      },
    };
    expect(selectIsLoading(mockedState)).toEqual(byIdState);
  });
  test('selectManifests -- should select the manifests mapped from state', () => {
    const byIdState = [
      {
        id: '1',
      },
      {
        id: '2',
      },
    ];
    const mockedState = {
      smanifest: {
        customersById: {},
        customerIds: [],
        facilitiesById: {},
        facilityIds: [],
        byId: {
          1: {
            id: '1',
          },
          2: {
            id: '2',
          },
        },
        ids: ['1', '2'],
        isLoading: false,
        errorMessage: null,
        enabled: false,
      },
    };
    expect(selectManifests(mockedState)).toEqual(byIdState);
  });
  test('selectManifestFacilities -- should select the manifests facilities mapped from state', () => {
    const byIdState = [
      {
        id: '1',
      },
      {
        id: '2',
      },
    ];
    const mockedState = {
      smanifest: {
        customersById: {},
        customerIds: [],
        facilitiesById: {
          1: {
            id: '1',
          },
          2: {
            id: '2',
          },
        },
        facilityIds: ['1', '2'],
        byId: {},
        ids: [],
        isLoading: false,
        errorMessage: null,
        enabled: false,
      },
    };
    expect(selectManifestFacilities(mockedState)).toEqual(byIdState);
  });
  test('selectManifestCustomers -- should select the manifest customers mapped from state', () => {
    const byIdState = [
      {
        id: '1',
      },
      {
        id: '2',
      },
    ];
    const mockedState = {
      smanifest: {
        customersById: {
          1: {
            id: '1',
          },
          2: {
            id: '2',
          },
        },
        customerIds: ['1', '2'],
        facilitiesById: {},
        facilityIds: [],
        byId: {},
        ids: [],
        isLoading: false,
        errorMessage: null,
        enabled: false,
      },
    };
    expect(selectManifestCustomers(mockedState)).toEqual(byIdState);
  });
});
