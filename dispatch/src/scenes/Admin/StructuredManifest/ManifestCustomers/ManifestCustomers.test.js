import { mount } from 'enzyme';
// import sinon from 'sinon';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';
import configureStore from 'state/store';
import ManifestCustomers from './ManifestCustomers';

describe('<ManifestCustomers />', () => {
  const initialState = {};

  const defaultProps = {
    isLoading: false,
    customers: [],
    history: createBrowserHistory(),
    fetchManifestCustomers: jest.fn(),
  };

  const testInstance = (props, state) => {
    const store = configureStore(state);

    const provider = mount(
      <Provider store={store}>
        <ManifestCustomers {...props} />
      </Provider>,
    );
    const wrapper = provider.find('ManifestCustomers');
    return { wrapper };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.exists('.sui-admin-header')).toEqual(true);
  });
  // it('calls componentDidMount', () => {
  //   sinon.spy(ManifestCustomers.prototype, 'componentDidMount');
  //   // eslint-disable-next-line no-unused-vars
  //   const { wrapper } = testInstance(defaultProps, initialState);
  //   expect(ManifestCustomers.prototype.componentDidMount).toHaveProperty(
  //     'callCount',
  //     1,
  //   );
  // });
  it('calls fetchManifestCustomers -- 3rd test, 3 mounts, 3 calls', () => {
    // eslint-disable-next-line no-unused-vars
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(defaultProps.fetchManifestCustomers.mock.calls.length).toBe(2);
  });

  it('should render with the form visible', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper.state('formVisible')).toEqual(true);
    expect(wrapper.find('form').length).toEqual(1);
  });
  it('should change the visibility of the form', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    wrapper.find('.toggle-form').simulate('click');
    expect(wrapper.state('formVisible')).toEqual(false);
  });
});
