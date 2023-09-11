import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import EditCanNotes from './';

describe('<EditCanNotes />', () => {
  const initialState = {};

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
    setting: {},
  };

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);

    const provider = mount(
      <Provider store={store}>
        <EditCanNotes {...props} />
      </Provider>,
    );
    const wrapper = provider.find('EditCanNotes');
    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.form--editCan-notes')).toHaveLength(1);
  });

  it('should create a note with or without the text and photo', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    const submitSpy = jest.spyOn(wrapper.instance(), 'onValidSubmit');
    wrapper.instance().onValidSubmit({ text: 'note', pictures: '' });

    wrapper.find('form').props().onSubmit(new Event('submit'));

    expect(submitSpy).toHaveBeenCalled();
  });
});
