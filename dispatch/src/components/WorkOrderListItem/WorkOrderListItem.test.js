import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import WorkOrderListItem from './WorkOrderListItem';

describe('<WorkOrderListItem />', () => {
  const defaultProps = {
    manageWoPollingInterval: jest.fn(),
    workOrder: {
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
    },
    workOrders: [
      {
        id: '1',
        action: 'FINAL',
        size: '10',
        index: 0,
      },
    ],
    id: '1',
    index: 0,
    provided: {
      innerRef: '',
      draggableProps: {
        style: {},
      },
    },
    locations: {
      list: [],
    },
    orderConfig: {
      name: 'spot',
      puzzlePositions: { top: true, bottom: false },
      bodyColor: '#60DF6C',
      color: '#000',
    },
  };

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);
    const provider = mount(
      <Provider store={store}>
        <WorkOrderListItem {...props} />
      </Provider>,
    );
    const wrapper = provider.find('WorkOrderListItem');

    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, {});
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.dispatch-row')).toHaveLength(1);
  });

  it('should execute onDragStart when dragstart event fired', () => {
    const { wrapper } = testInstance(defaultProps, {});
    const spy = jest.spyOn(wrapper.instance(), 'onDragStart');

    const event = new Event('dragstart');
    wrapper.instance().ref.dispatchEvent(event);
    expect(spy).toHaveBeenCalled();
  });

  it('should execute onDragEnd when dragend event fired', () => {
    const { wrapper } = testInstance(defaultProps, {});
    const spy = jest.spyOn(wrapper.instance(), 'onDragEnd');

    const event = new Event('dragend');
    wrapper.instance().ref.dispatchEvent(event);
    expect(spy).toHaveBeenCalled();
  });
});
