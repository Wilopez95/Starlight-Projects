import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { filterChange } from 'state/modules/workOrders';
import WorkOrdersTableFilter from './';

describe('<WorkOrdersTableFilter />', () => {
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
        <WorkOrdersTableFilter
          {...props}
          onChange={filter => store.dispatch(filterChange(filter))}
        />
      </Provider>,
    );
    const wrapper = provider.find('WorkOrdersTableFilter');
    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.form--filter-table')).toHaveLength(1);
  });

  it('should call the filter change action', () => {
    const { wrapper, store } = testInstance(defaultProps);
    wrapper.instance().onChange({}, true);
    expect(store.getActions()[0].type).toBe('@workorders/WOS_FILTER_CHANGE');
  });

  it('should call filter action with specified checkboxes checked', () => {
    const { wrapper, store } = testInstance(defaultProps);
    wrapper.instance().onChange(
      {
        scheduledStartAM: true,
        cow: true,
        sos: true,
      },
      true,
    );
    expect(store.getActions()[0].data.scheduledStartAM).toBeTruthy();
    expect(store.getActions()[0].data.cow).toBeTruthy();
    expect(store.getActions()[0].data.sos).toBeTruthy();
  });
});
