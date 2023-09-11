import { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Forms
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import { REPORT_DATE_FORMAT } from '@root/helpers/config';
import Label from '../elements/label';

export const dateIsRequiredErr = 'Last Change Before Date is required.';

export const parseConstantsToForm = (constantObj) =>
  R.values(constantObj).map((value) => ({ label: value, value }));

export const parseValueFromForm = (obj, currentValue, name) => {
  if (currentValue) {
    obj[name] = currentValue;
  }
};

const emptyState = {
  error: false,
  submitting: false,
  errors: {
    timezone: false,
  },
  beforeDate: moment().format(REPORT_DATE_FORMAT),
};

class ReportCansAging extends Component {
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
        timezone: {},
      },
    },
  };

  constructor(props) {
    super(props);
    /* istanbul ignore next */
    this.state = emptyState;

    this.onSubmit = this.onSubmit.bind(this);
  }

  handleDismiss = () => {
    this.props.onDismiss();
  };

  async onSubmit(formData) {
    this.setState({ submitting: true });

    try {
      const { onSubmit } = this.props;

      const { beforeDate } = formData;
      this.transformData(formData);
      const response = await onSubmit(this.newFilter);

      const fileName = [
        this.props.fileName,
        ['before', moment(beforeDate).format(REPORT_DATE_FORMAT)].join(' '),
      ].join(' - ');

      const fileHeaders = 'data:text/csv;charset=utf-8';

      this.download(encodeURI(`${fileHeaders}, ${response.data.replace(/#/g, 'no. ')}`), fileName);

      this.resetState();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      this.setState({ submitting: false });
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
    const { beforeDate, timezone } = data;

    this.newFilter = {};

    if (beforeDate) {
      this.newFilter.beforeDate = moment(beforeDate).format(REPORT_DATE_FORMAT);
    } else {
      throw new Error(dateIsRequiredErr);
    }

    parseValueFromForm(this.newFilter, timezone, 'timezone');
  }

  resetState() {
    this.setState(emptyState);
  }

  schema = Yup.object().shape({
    beforeDate: Yup.string().required('Required'),
    timezone: Yup.string().required('Required'),
  });

  render() {
    const {
      data: {
        constants: { timezone },
      },
    } = this.props;

    const timezones = parseConstantsToForm(timezone);
    return (
      <Formik
        enableReinitialize
        initialValues={{
          timezone: '',
          beforeDate: moment().format(REPORT_DATE_FORMAT),
        }}
        validationSchema={this.schema}
        onSubmit={(values) => this.onSubmit(values)}
      >
        {({ handleSubmit, values, errors, setFieldValue }) => (
          <form className="form form--report">
            <div className="form-row">
              <Label htmlFor="beforeDate">Last Change Before*</Label>
              <Field
                name="beforeDate"
                render={() => (
                  <ReactDatePicker
                    onChange={(value) => {
                      // this.setState({
                      //   beforeDate: value.format(REPORT_DATE_FORMAT),
                      // });
                      setFieldValue('beforeDate', value.format(REPORT_DATE_FORMAT));
                    }}
                    selected={moment(values.beforeDate)}
                    className="date-input"
                  />
                )}
              />
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
                  onClick={this.handleDismiss}
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

export default connect()(ReportCansAging);
