import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { exportCansAging } from 'state/modules/cans';
import ReportCansAging from './';

describe('<ReportCansAging />', () => {
  const initialState = {};

  const defaultProps = {};

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);

    const provider = mount(
      <Provider store={store}>
        <ReportCansAging
          {...props}
          onSubmit={data => store.dispatch(exportCansAging(data))}
        />
      </Provider>,
    );

    const wrapper = provider.find('ReportCansAging');
    return { wrapper, store };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.form--report')).toHaveLength(1);
  });

  it('should not submit with empty form', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    const submitSpy = jest.spyOn(wrapper.instance(), 'onSubmit');

    wrapper.find('.button__primary').props().onClick();

    expect(submitSpy).not.toHaveBeenCalled();
  });

  // it('should submit successfully with form filled out', async () => {
  //   const { wrapper, store } = testInstance(defaultProps, initialState);

  //   nock('http://localhost/reports/cans-aging')
  //     .get('')
  //     .query({
  //       beforeDate: moment().format('YYYY-MM-DD'),
  //       timezone: 'America/Denver',
  //     })
  //     .reply(200, { response: 'success' });

  //   await wrapper
  //     .find('Formik')
  //     .props()
  //     .onSubmit({
  //       timezone: 'America/Denver',
  //       beforeDate: moment().format('YYYY-MM-DD'),
  //     });
  //   expect(store.getActions()[1].type).toBe('EXPORT_CANS_AGING_SUCCESS');
  // });
});
