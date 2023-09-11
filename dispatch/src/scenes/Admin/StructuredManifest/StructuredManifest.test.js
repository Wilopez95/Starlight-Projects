import { mount } from 'enzyme';
// import sinon from 'sinon';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import configureStore from 'state/store';
import StructuredManifest from './StructuredManifest';

describe('<StructuredManifest />', () => {
  const initialState = {};

  const defaultProps = {
    isLoading: false,
    manifests: [],
    history: createBrowserHistory(),
    fetchStructuredManifestsIfNeeded: jest.fn(),
  };

  const testInstance = (props, state) => {
    const store = configureStore(state);

    const provider = mount(
      <Provider store={store}>
        <HashRouter>
          <StructuredManifest {...props} />
        </HashRouter>
      </Provider>,
    );
    const wrapper = provider.find('StructuredManifest');
    return { wrapper };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.exists('.sui-admin-header')).toEqual(true);
  });
  // it('calls componentDidMount', () => {
  //   sinon.spy(StructuredManifest.prototype, 'componentDidMount');
  //   // eslint-disable-next-line no-unused-vars
  //   const { wrapper } = testInstance(defaultProps, initialState);
  //   expect(StructuredManifest.prototype.componentDidMount).toHaveProperty(
  //     'callCount',
  //     1,
  //   );
  // });
  it('calls fetchFafetchStructuredManifestsIfNeededcilities -- 3rd test, 3 mounts, 3 calls', () => {
    // eslint-disable-next-line no-unused-vars
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(
      defaultProps.fetchStructuredManifestsIfNeeded.mock.calls.length,
    ).toBe(2);
  });
});
