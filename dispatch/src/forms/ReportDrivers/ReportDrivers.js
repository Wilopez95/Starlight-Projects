import { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { Field, Formik } from 'formik';
import ReactSelect from 'react-select';
import * as Yup from 'yup';
// Forms
import { REPORT_DATE_FORMAT } from '@root/helpers/config';
import FormError from '../elements/form-error';
import Label from '../elements/label';
import DateRangeInput from '../elements/DateRangeInput';

export const reportTypes = [
  {
    label: 'BY DAY',
    value: 'byDay',
  },
  {
    label: 'BY DATE RANGE',
    value: 'byDateRange',
  },
  {
    label: 'BY DATE RANGE (beta)',
    value: 'byDateRangeCanary',
  },
  {
    label: 'BY DAY (beta)',
    value: 'byDayCanary',
  },
];

export const dateIsRequiredErr = 'Scheduled Date Range is required';

const emptyState = {
  error: false,
  submitting: false,
  errors: {
    driverId: false,
    workOrderTypes: false,
    materialTypes: false,
    workOrderStatuses: false,
    reportType: false,
    timezone: false,
  },
  date: {
    startDate: {},
    endDate: {},
  },
  workOrderTypes: 'All',
  status: 'COMPLETED',
  materialType: 'All',
  reportType: 'BY DAY',
  driverId: 'All',
};

class ReportDrivers extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onDismiss: PropTypes.func,
    fileName: PropTypes.string,
    // eslint-disable-next-line
    data: PropTypes.object,
  };

  static defaultProps = {
    onDismiss: R.identity,
    fileName: 'export',
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

  constructor(props) {
    super(props);
    /* istanbul ignore next */
    this.state = {
      error: false,
      submitting: false,
      date: {
        startDate: {},
        endDate: {},
      },
      workOrderTypes: 'All',
      materialType: 'All',
      status: 'COMPLETED',
      driverId: 'All',
    };
  }

  async onSubmit(formData) {
    this.setState({ submitting: true, error: false });

    try {
      const { onSubmit } = this.props;

      const {
        date: { startDate, endDate },
      } = this.state;
      let workOrderActionTypes;
      if (this.state.workOrderTypes !== 'All') {
        workOrderActionTypes = this.state.workOrderTypes.map(
          (workOrderType) => workOrderType.value,
        );
        workOrderActionTypes = workOrderActionTypes.join(',');
      }

      let materialTypes;
      if (this.state.materialType !== 'All') {
        materialTypes = this.state.materialType.map((materialType) => materialType.value);
        materialTypes = materialTypes.join(',');
      }
      let driverIds;
      if (this.state.driverId !== 'All') {
        driverIds = this.state.driverId.map((dId) => dId.value);
        driverIds = driverIds.join(',');
      }
      let woStatus;
      if (this.state.status !== 'COMPLETED') {
        woStatus = this.state.status.map((stat) => stat.value);
        woStatus = woStatus.join(',');
      }

      this.transformData({
        ...formData,
        date: this.state.date,
        workOrderTypes: workOrderActionTypes,
        materialTypes,
        driverId: driverIds,
        workOrderStatuses: woStatus,
      });

      const response = await onSubmit(this.newFilter);

      const fileName = [
        this.props.fileName,
        this.newFilter.reportType.split(/(?=[A-Z])/).join(' '),
        [
          'from',
          moment(startDate).format(REPORT_DATE_FORMAT),
          'to',
          moment(endDate).format(REPORT_DATE_FORMAT),
        ].join(' '),
      ].join(' - ');

      const fileHeaders = 'data:text/csv;charset=utf-8';

      this.download(encodeURI(`${fileHeaders},${response.data}`), fileName);
      this.setState({ submitting: false });
    } catch (error) {
      this.setState({ error, submitting: false });
    }
  }

  download(file, fileName) {
    const link = document.createElement('a');
    link.setAttribute('href', file);
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  transformData(data) {
    const {
      driverId,
      date: { startDate, endDate },
      materialTypes,
      workOrderTypes,
      workOrderStatuses,
      reportType,
      timezone,
    } = data;

    this.newFilter = {};
    if (startDate && endDate) {
      const reportStartDate = moment(startDate).format(REPORT_DATE_FORMAT);
      const reportEndDate = moment(endDate).format(REPORT_DATE_FORMAT);
      this.newFilter.date = `${reportStartDate}..${reportEndDate}`;
    } else {
      throw new Error(dateIsRequiredErr);
    }
    this.parseValueFromForm(materialTypes, 'material');
    this.parseValueFromForm(workOrderTypes, 'action');
    this.parseValueFromForm(workOrderStatuses, 'status');
    this.parseValueFromForm(driverId, 'driverId');
    this.parseValueFromForm(timezone, 'timezone');
    this.newFilter.reportType = reportType || 'byDay';
  }

  parseValueFromForm(currentValue, name) {
    if (currentValue) {
      this.newFilter[name] = currentValue;
    }
  }

  parseDriversToForm(drivers) {
    return drivers.map((value) => ({
      label: value.description,
      value: value.id,
    }));
  }

  parseConstantsToForm(constantObj) {
    return R.values(constantObj).map((value) => ({ label: value, value }));
  }

  onChangeSelectStatuses = (value) => {
    if (!value) {
      this.selectStatuses.setValue('COMPLETED');
    }
  };

  resetState() {
    this.setState(emptyState);
  }

  schema = Yup.object().shape({
    timezone: Yup.string().required('Required'),
  });

  render() {
    const {
      data: {
        constants: {
          workOrder: { status, action, material },
          timezone,
        },
        drivers: { list },
      },
    } = this.props;

    const drivers = this.parseDriversToForm(list);
    const materials = this.parseConstantsToForm(material);
    const statuses = this.parseConstantsToForm(status);
    const types = this.parseConstantsToForm(action);
    const timezones = this.parseConstantsToForm(timezone);
    return (
      <Formik
        enableReinitialize
        initialValues={{
          driverId: '',
          workOrderTypes: '',
          materialTypes: '',
          workOrderStatuses: '',
          reportType: '',
          date: {
            startDate: '',
            endDate: '',
          },
          timezone: '',
        }}
        validationSchema={this.schema}
        onSubmit={(values) => this.onSubmit(values)}
      >
        {({ handleSubmit, values, errors }) => (
          <form className="form form--report">
            {this.state.error ? <FormError error={this.state.error} /> : null}
            <div className="form-row">
              <Label htmlFor="driverId">Drivers</Label>
              <Field
                name="driverId"
                render={() => (
                  <ReactSelect
                    name="driverId"
                    className="select"
                    clearable
                    searchable
                    options={drivers}
                    placeholder="All"
                    onChange={(drivers) => this.setState({ driverId: drivers })}
                    value={this.state.driverId}
                    isMulti
                  />
                )}
              />
            </div>
            <div className="form-row">
              <Label htmlFor="workOrderTypes">Work Order Types</Label>
              <Field
                name="workOrderTypes"
                render={() => (
                  <ReactSelect
                    name="workOrderTypes"
                    className="select"
                    clearable
                    searchable
                    options={types}
                    placeholder="All"
                    onChange={(workOrderTypes) => this.setState({ workOrderTypes })}
                    value={this.state.workOrderTypes}
                    isMulti
                  />
                )}
              />
            </div>
            <div className="form-row">
              <Label htmlFor="materialTypes">Material types</Label>
              <Field
                name="materialTypes"
                render={() => (
                  <ReactSelect
                    name="materialTypes"
                    className="select"
                    clearable
                    searchable
                    options={materials}
                    placeholder="All"
                    onChange={(materialType) => this.setState({ materialType })}
                    value={this.state.materialType}
                    isMulti
                  />
                )}
              />
            </div>
            <div className="form-row">
              <Label htmlFor="workOrderStatuses">Work Order Statuses</Label>
              <Field
                name="workOrderStatuses"
                render={() => (
                  <ReactSelect
                    name="workOrderStatuses"
                    className="select"
                    clearable
                    searchable
                    options={statuses}
                    placeholder=""
                    onChange={(status) => this.setState({ status })}
                    value={this.state.status}
                    isMulti
                  />
                )}
              />
            </div>
            <div className="form-row">
              <Label htmlFor="date">Scheduled Date Range*</Label>
              <DateRangeInput
                name="date"
                startDate={this.state.date.startDate}
                endDate={this.state.date.endDate}
                onChange={(date) => {
                  this.setState({ date });
                }}
              />
            </div>
            <div className="form-row">
              <Label htmlFor="reportType">Report Type</Label>
              <Field
                name="reportType"
                required
                component="select"
                className="text-input"
                value={values.reportType}
              >
                {reportTypes.map((reportType) => (
                  <option key={reportType.value} value={reportType.value}>
                    {reportType.label}
                  </option>
                ))}
              </Field>
            </div>
            <div className="form-row">
              <Label htmlFor="timezone">Time Zone</Label>
              <Field
                name="timezone"
                component="select"
                className={errors.timezone ? 'text-input error-required' : 'text-input'}
                value={values.timezone}
              >
                <option key="" value="" />
                {timezones.map((timezone) => (
                  <option key={timezone.value} value={timezone.value}>
                    {timezone.value}
                  </option>
                ))}
              </Field>
            </div>
            <footer className="form-footer">
              <div className="form-actions">
                <button
                  className="button button__empty mr-2"
                  type="button"
                  onClick={this.props.onDismiss}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="button button__primary"
                  disabled={this.state.submitting}
                >
                  Download
                </button>
              </div>
            </footer>
          </form>
        )}
      </Formik>
    );
  }
}

export default connect()(ReportDrivers);
