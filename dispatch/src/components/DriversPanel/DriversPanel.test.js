import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import DriversPanel from './DriversPanel';

describe('<DriversPanel />', () => {
  const initialState = {
    dispatcher: {
      filter: {},
    },
    setting: {},
    user: {
      id: 1,
      ids: [],
      isLoading: false,
      byId: {},
      roleId: 1,
    },
    waypoints: [],
    drivers: {
      list: [],
    },
    filter: {},
    workOrders: {
      filtered: [],
      filter: {},
    },
    workOrderNotes: {},
    cans: {
      filtered: [],
    },
    session: {
      user: {
        id: 1,
        ids: [],
        isLoading: false,
        byId: {},
        roleId: 4,
      },
    },
    constants: {
      can: {
        size: [],
      },
      workOrder: {
        material: [],
        action: {},
        status: {},
      },
    },
    locations: {
      locations: { byId: {}, ids: [] },
      trucks: { byId: {}, ids: [] },
      waypoints: { byId: {}, ids: [] },
    },
  };

  const defaultProps = {
    updatedState: {
      unassigned: [],
    },
    force: () => {},
  };

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);

    const provider = mount(
      <Provider store={store}>
        <DriversPanel {...props} />
      </Provider>,
    );
    const wrapper = provider.find('DriversPanel');

    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.driversPanel')).toHaveLength(1);

    expect(wrapper.find('DroppableList')).toHaveLength(0);
    expect(wrapper.find('DroppableDriverList')).toHaveLength(0);
  });

  it('should populate unassigned work order component from workOrders props', () => {
    const props = {
      updatedState: {
        unassigned: [
          {
            action: 'FINAL',
            contactName: 'Regina',
            contactNumber: '303-895-8025',
            customerName: 'REGINA ROTH',
            driver: { id: null },
            id: 200820,
            index: 4,
            location1: {
              id: 3019,
              name: '13995 Braun Road, Golden, CO, 80401',
            },
            location2: {},
            material: 'C & D',
            modifiedBy: 'smoore',
            size: '30',
            status: 'UNASSIGNED',
            suspensionLocation: { id: null },
          },
        ],
      },
      waypoints: [],
      force: () => {},
    };

    const newState = {
      ...initialState,
      showingUnassignedOrders: true,
    };

    const { wrapper } = testInstance(props, newState);
    expect(wrapper.find('DroppableList')).toHaveLength(1);
    expect(wrapper.find('DroppableDriverList')).toHaveLength(0);
    expect(wrapper.find('Driver')).toHaveLength(0);
    expect(wrapper.find('WorkOrderListItem')).toHaveLength(1);
  });

  it('should populate assigned work order list component', () => {
    const props = {
      drivers: {
        added: [
          {
            color: '#480000',
            createdBy: 'dan@marketsoup.com',
            createdDate: '2016-12-30T19:30:14.543Z',
            deleted: 0,
            id: 31,
            modifiedBy: 'Tatencio',
            modifiedDate: '2019-09-09T11:19:08.624Z',
            name: 'Tommy Atencio Rt00',
            photo: '',
            truck: { id: 1376, name: '44', type: 'TRUCK' },
            truckImage:
              'https://cdn.starlightpro.com/img/truck-icons/480000_truck.png',
            username: 'tommy.Atencio@5280waste.com',
          },
        ],
      },
      updatedState: {
        31: [
          {
            action: 'FINAL',
            contactName: 'Regina',
            contactNumber: '303-895-8025',
            customerName: 'REGINA ROTH',
            driver: {
              createdBy: 'dan@marketsoup.com',
              createdDate: '2016-12-30T19:30:14.543Z',
              deleted: 0,
              id: 31,
              modifiedBy: 'Tatencio',
              modifiedDate: '2019-09-09T11:19:08.624Z',
              name: 'Tommy Atencio Rt00',
              truck: { id: 1376, name: '44', type: 'TRUCK' },
              username: 'tommy.Atencio@5280waste.com',
            },
            id: 200820,
            index: 4,
            location1: {
              id: 3019,
              name: '13995 Braun Road, Golden, CO, 80401',
            },
            location2: {},
            material: 'C & D',
            modifiedBy: 'smoore',
            size: '30',
            status: 'ASSIGNED',
            suspensionLocation: { id: null },
          },
        ],
        unpublishedChanges: 0,
      },
      waypoints: [],
      force: () => {},
    };

    const newState = {
      ...initialState,
      drivers: {
        list: [
          {
            color: '#480000',
            createdBy: 'dan@marketsoup.com',
            createdDate: '2016-12-30T19:30:14.543Z',
            deleted: 0,
            id: 31,
            modifiedBy: 'Tatencio',
            modifiedDate: '2019-09-09T11:19:08.624Z',
            name: 'Tommy Atencio Rt00',
            photo: '',
            truck: { id: 1376, name: '44', type: 'TRUCK' },
            truckImage:
              'https://cdn.starlightpro.com/img/truck-icons/480000_truck.png',
            username: 'tommy.Atencio@5280waste.com',
          },
        ],
        added: [
          {
            color: '#480000',
            createdBy: 'dan@marketsoup.com',
            createdDate: '2016-12-30T19:30:14.543Z',
            deleted: 0,
            id: 31,
            modifiedBy: 'Tatencio',
            modifiedDate: '2019-09-09T11:19:08.624Z',
            name: 'Tommy Atencio Rt00',
            photo: '',
            truck: { id: 1376, name: '44', type: 'TRUCK' },
            truckImage:
              'https://cdn.starlightpro.com/img/truck-icons/480000_truck.png',
            username: 'tommy.Atencio@5280waste.com',
          },
        ],
      },
      showingAddDrivers: false,
      showingFilters: false,
    };

    const { wrapper } = testInstance(props, newState);
    wrapper.instance().onDriverClick({ id: 31 });

    expect(wrapper.find('DroppableList')).toHaveLength(0);
    expect(wrapper.find('DroppableDriverList')).toHaveLength(1);
    expect(wrapper.find('Driver')).toHaveLength(1);
    expect(wrapper.find('WorkOrderListItem')).toHaveLength(1);
  });
});
