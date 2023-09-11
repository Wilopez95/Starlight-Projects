/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/button-has-type */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faCalendarMinus, faPlus } from '@fortawesome/pro-regular-svg-icons';
import PendingSuspendedOrders from '@root/components/PendingSuspendedOrders';
import { dispatchFilterChange } from '@root/state/modules/dispatcher';
import { addAllDrivers } from '@root/state/modules/drivers';
import WaitingNeedsAction from '@root/static/images/waitingNeedsAction.svg';

class DriversPanelHeader extends Component {
  static propTypes = {
    addDriver: PropTypes.func.isRequired,
    force: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    drivers: PropTypes.object.isRequired,
    unpublishedChanges: PropTypes.number,
    workOrders: PropTypes.array,
    history: PropTypes.object,
  };

  state = {
    showingCalendar: false,
    showingPendingSuspended: false,
    date: {
      startDate: moment().format('MM/DD/YYYY'),
      endDate: moment().format('MM/DD/YYYY'),
    },
  };

  handleCloseCalendar = () => {
    this.setState({ showingCalendar: false });
  };

  handleOpenCalendar = () => {
    this.setState({ showingCalendar: true });
  };

  handleOnApply = (e, picker) => {
    const { force, dispatch } = this.props;
    const filter = {
      date: {
        startDate: picker.startDate.valueOf(),
        endDate: picker.endDate.valueOf(),
      },
    };
    this.setState({
      date: { startDate: picker.startDate, endDate: picker.endDate },
    });
    dispatch(dispatchFilterChange({ ...filter }));
    force({ ...filter }, true);
    this.setState({ showingCalendar: false });
  };

  handleAddAllDrivers = () => {
    const { dispatch } = this.props;
    dispatch(addAllDrivers());
    // force({}, true, false, false, false);
  };

  handleAddOneDriver = () => {
    if (!this.props.drivers.unadded.length) {
      return;
    }
    this.props.addDriver();
  };

  handleShowPendingSuspended = () => {
    this.setState((prevState) => ({
      showingPendingSuspended: !prevState.showingPendingSuspended,
    }));
  };

  render() {
    const { workOrders } = this.props;
    const isDisabled = this.props.unpublishedChanges !== 0;
    const hasRequestedSuspendedOrder = workOrders.map(
      (workorder) => workorder.suspendRequested || workorder.pendingSuspend,
    );
    return (
      <li className="listview-header">
        <div className="listview-header-action">
          <button
            type="button"
            role="button"
            className="btn hoverBorder"
            disabled={isDisabled}
            style={{
              height: '28px',
            }}
            onClick={this.handleAddOneDriver}
          >
            <FontAwesomeIcon
              icon={faPlus}
              style={{
                fontSize: '25px',
                border: '1px solid rgb(186, 186, 186)',
                padding: '2px',
                // borderRadius: '4px',
              }}
              className="hoverBorder"
            />
          </button>
        </div>
        <div className="listview-header-action">
          <button
            type="button"
            role="button"
            className="btn__all-drivers hoverBorder"
            onClick={this.handleAddAllDrivers}
            disabled={isDisabled}
          >
            Add All Drivers
          </button>
        </div>
        <div className="listview-header-title">DRIVERS LIST</div>
        <div className="listview-header-action">
          <span style={{ display: 'flex' }}>
            {hasRequestedSuspendedOrder.includes(true) === true ? <button
                type="button"
                className="btn__all-drivers hoverBorder"
                style={{ border: 'none', marginRight: '6px' }}
                onClick={this.handleShowPendingSuspended}
              >
                <WaitingNeedsAction style={{ width: '16px', height: '16px' }} />
              </button> : null}
            {this.state.showingPendingSuspended &&
            hasRequestedSuspendedOrder.includes(true) === true ? (
              <PendingSuspendedOrders
                workOrders={workOrders}
                menuId={4}
                history={this.props.history}
              />
            ) : null}
            {this.props.unpublishedChanges < 1 ? <DateRangePicker
                startDate={this.state.date.startDate}
                endDate={this.state.date.endDate}
                autoApply
                singleDatePicker
                onApply={this.handleOnApply}
                onCancel={this.handleCloseCalendar}
                onHide={this.handleCloseCalendar}
                onShow={this.handleOpenCalendar}
              >
                <FontAwesomeIcon
                  icon={this.state.showingCalendar ? faCalendarMinus : faCalendarPlus}
                  style={{
                    fontSize: '28px',
                    color: 'rgb(186, 186, 186)',
                  }}
                />
              </DateRangePicker> : null}
          </span>
        </div>
      </li>
    );
  }
}

const mapStateToProps = (state) => ({
  drivers: state.drivers,
});

export default connect(mapStateToProps)(DriversPanelHeader);
