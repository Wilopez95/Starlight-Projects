import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import EditCanDropoff from './';

describe('<EditCanDropoff />', () => {
  let sandbox;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const initialState = {
    location: {
      name: 'test',
      location: {
        lat: 0.0,
        lng: 0.0,
      },
    },
    isLocationValid: true,
  };

  const defaultProps = {
    can: {
      id: 'test',
      location: {
        location: {
          lat: 0.0,
          lng: 0.0,
        },
      },
    },
    setting: {
      map: {
        lat: 10,
        lon: 10,
        zoom: 10,
      },
    },
  };

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);

    const provider = mount(
      <Provider store={store}>
        <EditCanDropoff {...props} />
      </Provider>,
    );
    const wrapper = provider.find('EditCanDropoff');
    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.form--editCan-dropOff')).toHaveLength(1);
  });

  it('should not submit invalid data', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    const submitSpy = jest.spyOn(wrapper.instance(), 'onValidSubmit');

    wrapper.find('form').props().onSubmit(new Event('submit'));

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should edit the can when form is filled out properly', () => {
    const { wrapper } = testInstance(defaultProps, initialState);

    // sandbox.stub(request, 'put').returns(Promise.resolve({ data }));
    const submitSpy = jest.spyOn(wrapper.instance(), 'onValidSubmit');

    wrapper.setState({
      location: {
        name: 'test',
        location: {
          lat: 0.0,
          lng: 0.0,
        },
      },
      isLocationValid: true,
    });

    wrapper.instance().onValidSubmit({
      allowNullLocation: false,
    });
    wrapper.find('form').props().onSubmit(new Event('submit'));

    expect(submitSpy).toHaveBeenCalled();
  });
});
