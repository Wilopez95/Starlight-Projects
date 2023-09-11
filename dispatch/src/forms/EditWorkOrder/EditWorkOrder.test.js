import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import EditWorkOrder from './';

describe('<EditWorkOrder />', () => {
  const initialState = {
    workOrders: {
      single: {
        driver: {
          id: 1,
        },
        action: 'SPOT',
      },
    },
    constants: {
      workOrder: {
        status: 'NOT STARTED',
      },
      can: {
        size: '30',
      },
    },
    setting: {
      data: {},
      map: {
        lat: 10,
        lon: 10,
        zoom: 10,
      },
    },
    entities: {
      templates: {
        ids: [],
      },
      documents: {
        ids: [],
      },
    },
    documents: {
      ids: [],
    },
    templates: {
      ids: [],
    },
    location1: {
      name: 'test',
      location: {
        lon: 0,
        lat: 0,
      },
    },
    location2: {
      name: 'test',
      location: {
        lon: 0,
        lat: 0,
      },
    },
    action: 'SPOT',
    isLocationValid1: true,
    isLocationValid2: true,
  };

  const defaultProps = {
    onDismiss: () => {},
    action: 'edit',
    mapConfig: {
      lat: 10,
      lon: 10,
      zoom: 10,
    },
    workOrder: {
      action: 'SPOT',
    },
  };

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);
    const provider = mount(
      <BrowserRouter>
        <Provider store={store}>
          <EditWorkOrder {...props} />
        </Provider>
      </BrowserRouter>,
    );
    const wrapper = provider.find('EditWorkOrder');

    return { wrapper, store };
  };

  // it('should be successfully mounted', () => {
  //   const { wrapper } = testInstance(defaultProps, initialState);
  //   expect(wrapper).toBeDefined();
  //   expect(wrapper.find('.form--editWorkOrder')).toHaveLength(1);
  // });

  it('should update a work order with minimal required data', () => {
    const { wrapper, store } = testInstance(defaultProps, initialState);
    wrapper.setState({
      location1: {
        name: 'test',
        location: {
          lon: 0,
          lat: 0,
        },
      },
      location2: {
        name: 'test',
        location: {
          lon: 0,
          lat: 0,
        },
      },
      isLocationValid1: true,
      isLocationValid2: true,
      scheduledStart: '',
      scheduledEnd: '',
      scheduledDate: '2019-04-15',
    });
    const submitButton = wrapper.find('[type="submit"]');
    const submitSpy = jest.spyOn(wrapper.instance(), 'onValidSubmit');
    expect(submitButton).toHaveLength(1);
    wrapper.instance().onValidSubmit({
      action: 'SPOT',
      size: '30',
      material: 'C&D',
    });
    expect(submitSpy).toHaveBeenCalled();
    expect(store.getActions()[1].type).toBe('@workorders/UPDATE_WO_REQUEST');
  });
});
