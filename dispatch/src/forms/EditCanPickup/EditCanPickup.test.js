import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import EditCanPickup from './';

describe('<EditCanPickup />', () => {
  const initialState = {
    trucks: [
      {
        createdBy: 'ids',
        createdDate: '2018-06-04T16:47:14.044Z',
        deleted: 0,
        description: '',
        id: 14,
        location: { lon: -77.5221491, lat: 38.9690645 },
        modifiedBy: 'Cewell',
        modifiedDate: '2019-04-04T15:53:20.894Z',
        name: '25',
        seedName: null,
        type: 'TRUCK',
        waypointName: null,
        waypointType: null,
      },
    ],
    truckOpts: [
      { value: 14, label: 'truck' },
      { value: 2, label: 'big truck' },
    ],
    submitting: false,
  };

  const defaultProps = {
    can: {
      id: 'test',
      location: {
        name: 'test',
        location: {
          lat: 0.0,
          lng: 0.0,
        },
      },
    },
    truckOpts: [
      { value: 14, label: 'truck' },
      { value: 2, label: 'big truck' },
    ],
    onDismiss: () => {},
  };

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);

    const provider = mount(
      <Provider store={store}>
        <EditCanPickup {...props} dispatch={store.dispatch} />
      </Provider>,
    );

    const wrapper = provider.find('EditCanPickup');
    wrapper.setState({ loading: false });
    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.form--editCan-pickUp')).toHaveLength(1);
  });

  it('should not submit with no truck selected', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    const submitSpy = jest.spyOn(wrapper.instance(), 'onValidSubmit');

    wrapper.find('.button__primary').props().onClick();

    expect(submitSpy).not.toHaveBeenCalled();
  });
});
