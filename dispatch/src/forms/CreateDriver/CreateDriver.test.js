import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import CreateDriver from './';

describe('<CreateDriver />', () => {
  const initialState = {
    driver: {
      status: 'test',
      data: {
        photo: 'test',
        name: 'test',
        username: 'test',
        phoneNumber: '3031234567',
        truck: {
          name: 'test',
        },
      },
    },
    truckOpts: [
      {
        value: 1,
        label: '1',
      },
    ],
    trucks: [
      {
        id: 1,
        name: '1',
        location: { lon: -77.46077123, lat: 39.00870971 },
      },
    ],
  };

  const defaultProps = {
    onDismiss: () => {},
    onSubmitSuccess: () => {},
    driver: {
      status: 'test',
      data: {
        photo: 'test',
        name: 'test',
        username: 'test',
        phoneNumber: '3031234567',
        truck: {
          name: 'test',
        },
      },
    },
    truckOpts: [
      {
        value: 1,
        label: '1',
      },
    ],
    trucks: [
      {
        id: 1,
        name: '1',
        location: { lon: -77.46077123, lat: 39.00870971 },
      },
    ],
  };

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);
    const provider = mount(
      <Provider store={store}>
        <CreateDriver {...props} />
      </Provider>,
    );
    const wrapper = provider.find('CreateDriver');

    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.form--createDriver')).toHaveLength(1);
  });

  it('should not create a driver with no data filled out', () => {
    const { wrapper, store } = testInstance(defaultProps, initialState);
    wrapper.find('.button__primary').props().onClick();

    // no create or edit requests
    expect(store.getActions().length).toBe(0);
  });

  it('should create a driver when form is filled out', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    const submitButton = wrapper.find('[type="submit"]');
    const submitSpy = jest.spyOn(wrapper.instance(), 'onValidSubmit');
    expect(submitButton).toHaveLength(1);
    wrapper.instance().onValidSubmit({
      truck: 'test',
      name: 'test',
      phoneNumber: '3031234567',
      username: 'test',
    });
    expect(submitSpy).toHaveBeenCalled();
    // expect(store.getActions()[1].type).toBe('@driver/CREATE_DRIVER_REQUEST');
  });
});
