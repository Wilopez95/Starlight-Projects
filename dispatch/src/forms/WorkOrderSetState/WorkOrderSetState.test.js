import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import nock from 'nock';
import WorkOrderSetState from './';

describe('<WorkOrderSetState />', () => {
  const initialState = {
    constants: {
      actionTransitionsOrdered: [],
      workOrder: {
        note: {
          transitionState: '',
        },
      },
    },
    workOrders: {
      single: {
        action: {},
      },
    },
  };

  const defaultProps = {
    workOrderId: 'test',
  };

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);

    const provider = mount(
      <Provider store={store}>
        <WorkOrderSetState {...props} dispatch={store.dispatch} />
      </Provider>,
    );

    const wrapper = provider.find('WorkOrderSetState');
    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.form--setWorkOrderState')).toHaveLength(1);
  });

  it('should not submit with empty form', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    const submitSpy = jest.spyOn(wrapper.instance(), 'onValidSubmit');

    wrapper.find('.btn__success').props().onClick();

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should submit with filled out form', async () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    const submitSpy = jest.spyOn(wrapper.instance(), 'onValidSubmit');

    nock('http://localhost/workorders')
      .get('/test')
      .reply(200, { response: 'success' })
      .post('/test')
      .reply(201, { response: 'success' });

    await wrapper.instance().onValidSubmit({
      type: 'COMPLETED',
    });

    expect(submitSpy).toHaveBeenCalled();
  });
});
