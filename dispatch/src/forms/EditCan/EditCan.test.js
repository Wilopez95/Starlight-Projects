import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import sinon from 'sinon';
import configureMockStore from 'redux-mock-store';
import request from 'helpers/request';
import EditCan from './';

const initialState = {};

const defaultProps = {
  sizes: [],
  can: {
    id: 'test',
    name: 'test',
    size: '20',
    serial: '1234567',
    requiresMaintenance: false,
    outOfService: false,
    hazardous: false,
  },
};
const data = { test: 'test' };

const testInstance = (props, state) => {
  const mockStore = configureMockStore([thunk]);
  const store = mockStore(state);

  const provider = mount(
    <Provider store={store}>
      <EditCan {...props} dispatch={store.dispatch} />
    </Provider>,
  );
  const wrapper = provider.find('EditCan');
  return { wrapper, store };
};

describe('<EditCan />', () => {
  let sandbox;

  beforeAll(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.form--editCan-info')).toHaveLength(1);
  });

  it('should not submit invalid data', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    const submitSpy = jest.spyOn(wrapper.instance(), 'onValidSubmit');

    wrapper.find('.button__primary').props().onClick();

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should edit the can when form is filled out properly', async () => {
    const { wrapper, store } = testInstance(defaultProps, initialState);

    sandbox.stub(request, 'put').returns(Promise.resolve({ data }));

    await wrapper.instance().onValidSubmit({});
    expect(store.getActions()[1].type).toBe('@cans/UPDATE_CAN_SUCCESS');
  });
});
