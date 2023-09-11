import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import EditCanMove from './';

const initialState = {
  location: {
    name: '107 Broadway, Denver, CO 80203, USA',
    location: { lon: -104.9877159, lat: 39.71864250000001 },
  },
  isLocationValid: true,
};

const defaultProps = {
  locations: [],
  can: {
    id: 1170,
    location: {
      location: {
        lat: 0.0,
        lng: 0.0,
      },
    },
  },
  onMoveCan: jest.fn(),
  setting: {
    map: {
      lat: 10,
      lon: 10,
      zoom: 10,
    },
  },
};

describe('<EditCanMove />', () => {
  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);

    const provider = mount(
      <Provider store={store}>
        <EditCanMove {...props} />
      </Provider>,
    );
    const wrapper = provider.find('EditCanMove');
    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.form--editCan-move')).toHaveLength(1);
  });

  it('should not submit invalid data', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    const submitSpy = jest.spyOn(wrapper.instance(), 'onValidSubmit');

    wrapper.find('form').props().onSubmit(new Event('submit'));

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should edit the can when form is filled out properly', async () => {
    const { wrapper } = testInstance(defaultProps, initialState);

    const submitSpy = jest.spyOn(wrapper.instance(), 'onValidSubmit');
    wrapper.setState({
      location: {
        name: '107 Broadway, Denver, CO 80203, USA',
        location: { lon: -104.9877159, lat: 39.71864250000001 },
      },
      isLocationValid: true,
    });

    await wrapper.instance().onValidSubmit({
      allowNullLocation: false,
    });

    wrapper.find('form').props().onSubmit(new Event('submit'));

    expect(submitSpy).toHaveBeenCalled();
  });
});
