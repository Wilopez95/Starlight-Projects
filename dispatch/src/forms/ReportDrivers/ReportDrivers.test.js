import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import moment from 'moment';
import { exportDrivers } from 'state/modules/drivers';
import { REPORT_DATE_FORMAT } from 'helpers/config';
import ReportDrivers from './';

describe('<ReportDrivers />', () => {
  const initialState = {
    date: {
      startDate: moment().format(REPORT_DATE_FORMAT),
      endDate: moment().format(REPORT_DATE_FORMAT),
    },
  };

  const defaultProps = {
    onDismiss: () => {},
    onSuccessSubmit: () => {},
    fileName: 'export',
    filter: {},
    data: {
      constants: {
        workOrder: {
          status: {},
          action: {},
          material: {},
        },
        timezone: {},
      },
      drivers: {
        list: [],
      },
    },
  };

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);

    const provider = mount(
      <Provider store={store}>
        <ReportDrivers
          {...props}
          onSubmit={async data => await store.dispatch(exportDrivers(data))}
        />
      </Provider>,
    );

    const wrapper = provider.find('ReportDrivers');
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

  //   nock('http://localhost/reports/drivers')
  //     .get('')
  //     .query({
  //       date: `${moment().format('YYYY-MM-DD')}..${moment().format(
  //         'YYYY-MM-DD',
  //       )}`,
  //       timezone: 'America/Denver',
  //       reportType: 'byDay',
  //     })
  //     .reply(200, { response: 'success' });

  //   wrapper.setState({
  //     date: {
  //       startDate: moment().format('YYYY-MM-DD'),
  //       endDate: moment().format('YYYY-MM-DD'),
  //     },
  //     materialType: [{ label: 'Asphalt', value: 'Asphalt' }],
  //     driverIds: [{ label: 'Asphalt', value: 'Asphalt' }],
  //   });

  //   await wrapper
  //     .find('Formik')
  //     .props()
  //     .onSubmit({
  //       date: {
  //         startDate: moment().format('YYYY-MM-DD'),
  //         endDate: moment().format('YYYY-MM-DD'),
  //       },
  //       timezone: 'America/Denver',
  //       reportType: 'byDay',
  //     });
  //   expect(store.getActions()[1].type).toBe('EXPORT_DRIVERS_SUCCESS');
  // });
});
