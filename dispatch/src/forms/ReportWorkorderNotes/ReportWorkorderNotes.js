// ReportWorkorderNotes
import { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import { REPORT_DATE_FORMAT } from '@root/helpers/config';
import FormError from '../elements/form-error';
import Label from '../elements/label';
import DateRangeInput from '../elements/DateRangeInput';

export const dateIsRequiredErr = 'Scheduled Date Range is required';

const emptyState = {
  error: false,
  submitting: false,
  errors: {},
  date: {
    startDate: {},
    endDate: {},
  },
};

class ReportWorkorderNotes extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    fileName: PropTypes.string,
    onDismiss: PropTypes.func,
    // eslint-disable-next-line
    data: PropTypes.object,
  };

  static defaultProps = {
    fileName: 'export',
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
    };
  }

  async onSubmit(formData) {
    this.setState({ submitting: true, error: false });

    try {
      const { onSubmit } = this.props;

      const {
        date: { startDate, endDate },
      } = this.state;

      this.transformData({
        ...formData,
        date: this.state.date,
      });

      const response = await onSubmit(this.newFilter);

      const fileName = [
        this.props.fileName,
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
      date: { startDate, endDate },
    } = data;

    this.newFilter = {};
    if (startDate && endDate) {
      const reportStartDate = moment(startDate).format(REPORT_DATE_FORMAT);
      const reportEndDate = moment(endDate).format(REPORT_DATE_FORMAT);
      this.newFilter.date = `${reportStartDate}..${reportEndDate}`;
    } else {
      throw new Error(dateIsRequiredErr);
    }
  }

  resetState() {
    this.setState(emptyState);
  }

  render() {
    return (
      <Formik
        enableReinitialize
        initialValues={{
          date: {
            startDate: '',
            endDate: '',
          },
        }}
        validationSchema={this.schema}
        onSubmit={(values) => this.onSubmit(values)}
      >
        {({ handleSubmit }) => (
          <form className="form form--report">
            {this.state.error ? <FormError error={this.state.error} /> : null}
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

export default ReportWorkorderNotes;
