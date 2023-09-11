import PropTypes from 'prop-types';
import { Component } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import DateRangePicker from 'react-bootstrap-daterangepicker';

class DateRangeTimestampInput extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    isPristine: PropTypes.bool,
    value: PropTypes.object,
    showRequired: PropTypes.bool,
  };

  onApply = (event, { startDate, endDate }) => {
    this.props.onChange({
      startDate: startDate.valueOf(),
      endDate: endDate.valueOf(),
    });
  };

  reset = () => {
    this.props.onChange({
      startDate: new Date().getTime(),
      endDate: new Date().getTime(),
    });
  };

  render() {
    let { startDate, endDate } = this.props.value || this.props;
    const isEmptyDates = !startDate || !endDate;

    startDate = startDate ? moment(startDate) : moment();
    endDate = endDate ? moment(endDate) : moment();

    const classes = classNames('date-input', {
      'error-required': !this.props.isPristine && this.props.showRequired,
    });

    const placeholder = isEmptyDates ? 'Select date range' : '';
    const value = isEmptyDates
      ? ''
      : `${startDate.format('MM/DD/YYYY')} - ${endDate.format('MM/DD/YYYY')}`;
    const locale = {
      format: 'MM/DD/YYYY',
      separator: ' - ',
      applyLabel: 'Apply',
      cancelLabel: 'Clear',
      weekLabel: 'W',
      customRangeLabel: 'Custom Range',
      daysOfWeek: moment.weekdaysMin(),
      monthNames: moment.monthsShort(),
      firstDay: moment.localeData().firstDayOfWeek(),
    };

    return (
      <div className="control">
        <DateRangePicker
          name="date"
          startDate={startDate}
          endDate={endDate}
          autoApply
          onCancel={this.reset}
          onApply={this.onApply}
          applyClass="btn btn__success"
          cancelClass="btn btn__link"
          locale={locale}
        >
          <input
            className={classes}
            value={value}
            placeholder={placeholder}
            readOnly
            style={{ color: value ? '#434343' : '#dcdcdc' }}
          />
        </DateRangePicker>
      </div>
    );
  }
}

export default DateRangeTimestampInput;
