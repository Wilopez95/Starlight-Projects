import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { filterChange } from 'state/modules/cans';
import CansFilter from './';

describe('<CansFilter />', () => {
  const initialState = {
    date: {
      startDate: '',
      endDate: '',
    },
    search: '',
  };

  const defaultProps = {};

  const testInstance = props => {
    const store = configureStore([thunk])(initialState);

    const provider = mount(
      <Provider store={store}>
        <CansFilter
          {...props}
          onChange={filter => store.dispatch(filterChange(filter))}
        />
      </Provider>,
    );
    const wrapper = provider.find('CansFilter');
    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.form--filter-aside')).toHaveLength(1);
  });

  it('should call the filter change action', () => {
    const { wrapper, store } = testInstance(defaultProps);
    wrapper.instance().onChange({}, true);
    expect(store.getActions()[0].type).toBe('@cans/CANS_FILTER_CHANGE');
  });

  it('should call filter action with specified search', () => {
    const { wrapper, store } = testInstance(defaultProps);
    wrapper.setState({ search: 'test' });
    wrapper.instance().onChange({});
    expect(store.getActions()[0].data.search).toBe('test');
  });

  it('should call filter action with specified checkboxes checked', () => {
    const { wrapper, store } = testInstance(defaultProps);
    wrapper.instance().onChange(
      {
        isRequiredMaintenance: true,
        isOutOfService: true,
        allowNullLocations: true,
      },
      true,
    );
    expect(store.getActions()[0].data.isRequiredMaintenance).toBeTruthy();
    expect(store.getActions()[0].data.isOutOfService).toBeTruthy();
    expect(store.getActions()[0].data.allowNullLocations).toBeTruthy();
  });
});
