import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import ForgotPassword from './';

describe('<ForgotPassword />', () => {
  const initialState = {};

  const defaultProps = {
    handleSubmitForm: () => {},
    onSuccess: () => {},
  };

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);

    const provider = mount(
      <Provider store={store}>
        <ForgotPassword {...props} dispatch={store.dispatch} />
      </Provider>,
    );

    const wrapper = provider.find('ForgotPassword');
    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.form__login')).toHaveLength(1);
  });

  it('should not submit with empty form', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    const submitSpy = jest.spyOn(wrapper.instance(), 'onValidSubmit');

    wrapper.find('.btn__success').props().onClick();

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should not submit with empty form', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    const submitSpy = jest.spyOn(wrapper.instance(), 'onValidSubmit');

    wrapper.find('Formik').props().onSubmit({
      email: 'test@test.com',
    });

    expect(submitSpy).toHaveBeenCalled();
  });
});
