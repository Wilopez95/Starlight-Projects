import {
  getLocations,
  getLocationsLoading,
  createSelectLocationsLocations,
  locationsById,
  getLocationIds,
  selectLocations,
  selectCurrentLocation,
  selectLocation,
  getTrucks,
  getTrucksById,
  getTrucksIds,
  selectTrucks,
  getWaypoints,
  getWaypointsById,
  getWaypointIds,
  selectWaypoints,
} from './selectors';

describe('Locations Selectors', () => {
  test('getLocations -- should select the locations state', () => {
    const locationsState = {
      locations: { byId: {}, ids: [] },
      trucks: { byId: {}, ids: [] },
      waypoints: { byId: {}, ids: [] },
      current: {},
      isLoading: false,
      error: null,
    };
    const mockedState = {
      locations: locationsState,
    };
    expect(getLocations(mockedState)).toEqual(locationsState);
  });
  test('getLocationsLoading -- should select the locations isLoading state', () => {
    const loadingState = true;
    const mockedState = {
      locations: {
        locations: { byId: {}, ids: [] },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: true,
        error: null,
      },
    };
    expect(getLocationsLoading(mockedState)).toEqual(loadingState);
  });
  test('createSelectLocationsLocations -- should select the locations locations state', () => {
    const locationsLocations = { byId: {}, ids: [] };
    const mockedState = {
      locations: {
        locations: { byId: {}, ids: [] },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: null,
      },
    };
    const selectLocs = createSelectLocationsLocations();
    expect(selectLocs(mockedState)).toEqual(locationsLocations);
  });
  test('locationsById -- should select the locations byId state', () => {
    const byIdState = {
      1: {
        id: '1',
        name: 'test',
      },
    };
    const mockedState = {
      locations: {
        locations: {
          byId: {
            1: {
              id: '1',
              name: 'test',
            },
          },
          ids: [],
        },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: null,
      },
    };
    expect(locationsById(mockedState)).toEqual(byIdState);
  });
  test('getLocationIds -- should select the locations ids state', () => {
    const idsState = ['1'];
    const mockedState = {
      locations: {
        locations: {
          byId: {
            1: {
              id: '1',
              name: 'test',
            },
          },
          ids: ['1'],
        },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: null,
      },
    };
    expect(getLocationIds(mockedState)).toEqual(idsState);
  });
  test('selectLocations -- should select the locations mapped byId and ids state', () => {
    const mappedState = [
      {
        id: '1',
        name: 'test',
      },
    ];
    const mockedState = {
      locations: {
        locations: {
          byId: {
            1: {
              id: '1',
              name: 'test',
            },
          },
          ids: ['1'],
        },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: null,
      },
    };
    expect(selectLocations(mockedState)).toEqual(mappedState);
  });
  test('selectCurrentLocation -- should select a location from the byId state', () => {
    const currentState = {
      id: '1',
      name: 'test',
    };

    const mockedState = {
      locations: {
        locations: {
          byId: {
            1: {
              id: '1',
              name: 'test',
            },
          },
          ids: ['1'],
        },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {
          id: '1',
          name: 'test',
        },
        isLoading: false,
        error: null,
      },
    };
    expect(selectCurrentLocation(mockedState)).toEqual(currentState);
  });
  test('selectLocation -- should select the location from the byId state', () => {
    const mappedState = {
      id: '1',
      name: 'test',
    };
    const mockedState = {
      locations: {
        locations: {
          byId: {
            1: {
              id: '1',
              name: 'test',
            },
          },
          ids: ['1'],
        },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: null,
      },
    };
    expect(selectLocation(mockedState, '1')).toEqual(mappedState);
  });
  test('getTrucks -- should select the trucks state', () => {
    const trucksState = {
      byId: {},
      ids: [],
    };

    const mockedState = {
      locations: {
        locations: {
          byId: {},
          ids: [],
        },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: null,
      },
    };
    expect(getTrucks(mockedState)).toEqual(trucksState);
  });
  test('getTrucksById -- should select the trucks byId state', () => {
    const byIdState = {
      1: {
        id: '1',
        name: 'test',
      },
    };

    const mockedState = {
      locations: {
        locations: {
          byId: {},
          ids: [],
        },
        trucks: {
          byId: {
            1: {
              id: '1',
              name: 'test',
            },
          },
          ids: ['1'],
        },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: null,
      },
    };
    expect(getTrucksById(mockedState)).toEqual(byIdState);
  });
  test('getTrucksIds -- should select the trucks ids state', () => {
    const idsState = ['1'];

    const mockedState = {
      locations: {
        locations: {
          byId: {},
          ids: [],
        },
        trucks: {
          byId: {
            1: {
              id: '1',
              name: 'test',
            },
          },
          ids: ['1'],
        },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: null,
      },
    };
    expect(getTrucksIds(mockedState)).toEqual(idsState);
  });
  test('selectTrucks -- should select the trucks mapped by ids and byId from state', () => {
    const trucks = [
      {
        id: '1',
        name: 'test',
      },
    ];

    const mockedState = {
      locations: {
        locations: {
          byId: {},
          ids: [],
        },
        trucks: {
          byId: {
            1: {
              id: '1',
              name: 'test',
            },
          },
          ids: ['1'],
        },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: null,
      },
    };
    expect(selectTrucks(mockedState)).toEqual(trucks);
  });
  test('getWaypoints -- should select the waypoints state', () => {
    const waypointsState = {
      byId: {},
      ids: [],
    };

    const mockedState = {
      locations: {
        locations: {
          byId: {},
          ids: [],
        },
        trucks: { byId: {}, ids: [] },
        waypoints: { byId: {}, ids: [] },
        current: {},
        isLoading: false,
        error: null,
      },
    };
    expect(getWaypoints(mockedState)).toEqual(waypointsState);
  });
  test('getWaypointsById -- should select the waypoints byId state', () => {
    const byIdState = {
      1: {
        id: '1',
        name: 'test',
      },
    };

    const mockedState = {
      locations: {
        locations: {
          byId: {},
          ids: [],
        },
        trucks: { byId: {}, ids: [] },
        waypoints: {
          byId: {
            1: {
              id: '1',
              name: 'test',
            },
          },
          ids: [],
        },
        current: {},
        isLoading: false,
        error: null,
      },
    };
    expect(getWaypointsById(mockedState)).toEqual(byIdState);
  });
  test('getWaypointIds -- should select the waypoints ids state', () => {
    const idsState = ['1'];

    const mockedState = {
      locations: {
        locations: {
          byId: {},
          ids: [],
        },
        trucks: { byId: {}, ids: [] },
        waypoints: {
          byId: {
            1: {
              id: '1',
              name: 'test',
            },
          },
          ids: ['1'],
        },
        current: {},
        isLoading: false,
        error: null,
      },
    };
    expect(getWaypointIds(mockedState)).toEqual(idsState);
  });
  test('selectWaypoints -- should select the waypoints mapped by ids and byId from state', () => {
    const waypoints = [
      {
        id: '1',
        name: 'test',
      },
    ];

    const mockedState = {
      locations: {
        locations: {
          byId: {},
          ids: [],
        },
        trucks: {
          byId: {},
          ids: [],
        },
        waypoints: {
          byId: {
            1: {
              id: '1',
              name: 'test',
            },
          },
          ids: ['1'],
        },
        current: {},
        isLoading: false,
        error: null,
      },
    };
    expect(selectWaypoints(mockedState)).toEqual(waypoints);
  });
});
