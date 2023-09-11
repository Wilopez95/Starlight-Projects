import { mount } from 'enzyme';
import { BrowserRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import CreateWorkOrder from './';

describe('<CreateWorkOrder />', () => {
  const initialState = {
    locations: {
      locations: { byId: {}, ids: [] },
      trucks: { byId: {}, ids: [] },
      waypoints: { byId: {}, ids: [] },
    },
    workOrders: {
      single: {
        driver: {
          id: 1,
        },
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
      map: {
        lat: 10,
        lon: 10,
        zoom: 10,
      },
      data: {},
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
    },
    dispatcher: {
      filter: {},
    },
    // workOrders: [],
  };

  const defaultProps = {
    onDismiss: () => {},
    action: 'create',
    locations: [],
    mapConfig: {
      lat: 10,
      lon: 10,
      zoom: 10,
    },
  };

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);
    const provider = mount(
      <BrowserRouter>
        <Provider store={store}>
          <CreateWorkOrder {...props} />
        </Provider>
      </BrowserRouter>,
    );
    const wrapper = provider.find('CreateWorkOrder');

    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.form--editWorkOrder')).toHaveLength(1);
  });
});
