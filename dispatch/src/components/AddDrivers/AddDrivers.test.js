import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import AddDrivers from './AddDrivers';

describe('<AddDrivers />', () => {
  const initialState = {
    drivers: {
      filtered: [],
    },
  };

  const defaultProps = {
    toggleAddDrivers: () => {},
    dispatch: () => {},
    force: () => {},
  };

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);
    const provider = mount(
      <Provider store={store}>
        <AddDrivers {...props} />
      </Provider>,
    );
    const wrapper = provider.find('AddDrivers');

    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('#newDrivers')).toHaveLength(1);
  });

  it('should have empty drivers array by default', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper.props().drivers.filtered).toHaveLength(0);
  });

  it('should call add driver action upon clicking list item', () => {
    const state = {
      drivers: {
        filtered: [
          {
            id: '1',
            name: 'test1',
            photo:
              'https://starlight-asset.s3.amazonaws.com/dmap/img/driver_add.png',
          },
          {
            id: '2',
            name: 'test2',
            photo:
              'https://starlight-asset.s3.amazonaws.com/dmap/img/driver_add.png',
          },
        ],
      },
    };
    const { wrapper, store } = testInstance(defaultProps, state);
    expect(wrapper.props().drivers.filtered).toHaveLength(2);
    wrapper.find('.listview-content').get(0).props.onClick();

    expect(store.getActions()).toHaveLength(2);
    expect(store.getActions()[1].type).toBe('@drivers/ADD_DRIVER');
  });

  it('should set filtered drivers and search value upon changing search', () => {
    const state = {
      drivers: {
        unadded: [
          {
            id: '1',
            name: 'test1',
            photo:
              'https://starlight-asset.s3.amazonaws.com/dmap/img/driver_add.png',
          },
        ],
        filtered: [
          {
            id: '1',
            name: 'test1',
            photo:
              'https://starlight-asset.s3.amazonaws.com/dmap/img/driver_add.png',
          },
        ],
      },
    };
    const { wrapper, store } = testInstance(defaultProps, state);
    wrapper
      .find('#searchText')
      .get(0)
      .props.onChange({
        target: {
          value: 'test',
        },
      });
    expect(store.getActions()).toHaveLength(2);
    expect(store.getActions()[0].type).toBe('@drivers/SET_FILTERED_DRIVERS');
    expect(wrapper.state().searchValue).toBe('test');
  });
});
