import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import WorkOrderAddNote from './';

describe('<WorkOrderAddNote />', () => {
  const initialState = {
    workOrderNotes: {
      isUploading: false,
    },
    user: {
      username: '',
    },
  };

  const defaultProps = {
    workOrderId: 'test',
    user: {
      username: '',
    },
  };

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);

    const provider = mount(
      <Provider store={store}>
        <WorkOrderAddNote {...props} dispatch={store.dispatch} />
      </Provider>,
    );

    const wrapper = provider.find('WorkOrderAddNote');
    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.form--addWorkOrderNote')).toHaveLength(1);
  });

  it('should not submit with empty form', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    const submitSpy = jest.spyOn(wrapper.instance(), 'onValidSubmit');

    wrapper.find('.btn__success').props().onClick();

    expect(submitSpy).not.toHaveBeenCalled();
  });
});
