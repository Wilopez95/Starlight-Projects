import {
  getWorkOrders,
  createSelectFilteredWos,
  createSelectWosFilter,
} from './selectors';

describe('Work Orders Selectors', () => {
  test('getWorkOrders -- should select the workOrders state', () => {
    const wosState = {
      active: false,
      isLoading: false,
      single: {},
      isUpdating: false,
      list: [],
      filtered: [],
      filter: {},
    };
    const mockedState = {
      workOrders: wosState,
    };
    expect(getWorkOrders(mockedState)).toEqual(wosState);
  });
  test('createSelectFilteredWos -- should select the workOrders filtered state', () => {
    const filteredState = [{ id: '1' }];
    const mockedState = {
      workOrders: {
        active: false,
        isLoading: false,
        single: {},
        isUpdating: false,
        list: [],
        filtered: [{ id: '1' }],
        filter: {},
      },
    };
    const selectFiltered = createSelectFilteredWos();
    expect(selectFiltered(mockedState)).toEqual(filteredState);
  });
  test('createSelectWosFilter -- should select the workOrders filter state', () => {
    const filteredState = {
      bounds: 1,
      search: null,
      modifiedSince: null,
      driverId: null,
      size: null,
      material: null,
      action: null,
      status: null,
      scheduledStart: null,
      scheduledStartPM: null,
      scheduledStartAM: null,
      cow: null,
      sos: null,
    };
    const mockedState = {
      workOrders: {
        active: false,
        isLoading: false,
        single: {},
        isUpdating: false,
        list: [],
        filtered: [],
        filter: {
          bounds: 1,
          search: null,
          modifiedSince: null,
          driverId: null,
          size: null,
          material: null,
          action: null,
          status: null,
          scheduledStart: null,
          scheduledStartPM: null,
          scheduledStartAM: null,
          cow: null,
          sos: null,
        },
      },
    };
    const selectFilter = createSelectWosFilter();
    expect(selectFilter(mockedState)).toEqual(filteredState);
  });
});
