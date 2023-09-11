import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import sinon from 'sinon';
import Driver from './Driver';

describe('<Driver />', () => {
  const initialState = {};

  const defaultProps = {
    driver: {
      id: '1',
      photo: 'https://starlight-asset.s3.amazonaws.com/dmap/img/del-driver.png',
      name: 'test',
    },
    workOrders: [],
    filter: {},
    force: () => {},
    onRemoveDriver: () => {},
    onDriverClick: () => {},
  };

  const testInstance = (props, state, spies = {}) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);
    const provider = mount(
      <Provider store={store}>
        <Driver {...props} {...spies} />
      </Provider>,
    );
    const wrapper = provider.find('Driver');

    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.driver-list-item')).toHaveLength(1);
  });

  it('should fire the function to show the panel', () => {
    const spies = {
      onDriverClick: sinon.spy(),
    };
    const { wrapper } = testInstance(defaultProps, initialState, spies);
    expect(wrapper).toBeDefined();
    wrapper.find('.driver-photo').get(0).props.onClick();

    expect(spies.onDriverClick.callCount).toBe(1);
  });
});
