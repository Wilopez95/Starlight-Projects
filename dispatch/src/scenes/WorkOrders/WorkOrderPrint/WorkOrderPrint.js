/* eslint-disable react/no-did-mount-set-state */
import { Component } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import moment from 'moment';
import isEqual from 'lodash/isEqual';

import { fetchConstantsIfNeeded } from '@root/state/modules/constants';
import { fetchWorkOrderNotes, forgetWorkOrderNotes } from '@root/state/modules/workOrderNotes';
import { fetchWorkOrder } from '@root/state/modules/workOrders';
import { fetchSettingByKey } from '@root/state/modules/settings';
// Components
import DataList from '@root/components/DataList';
import WorkOrderHistoryNote from '@root/components/WorkOrderHistoryNote';
import WorkOrderHistoryMap from '@root/components/WorkOrderHistoryMap';
import logo from '../../../static/images/logo.png';

export const sortNotes = R.comparator((a, b) => {
  const momentA = moment(a.createdDate);
  const momentB = moment(b.createdDate);
  return momentA.isAfter(momentB);
});

class WorkOrderPrint extends Component {
  static displayName = 'WorkOrderPrint';

  static propTypes = {
    workOrder: PropTypes.object,
    notes: PropTypes.array,
    dispatch: PropTypes.func,
    match: PropTypes.object,
    mapConfig: PropTypes.object,
    notesStates: PropTypes.object,
    user: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: null,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    const { workOrderId } = this.props.match.params;

    try {
      await Promise.all([
        dispatch(fetchSettingByKey('map')),
        dispatch(fetchConstantsIfNeeded()),
        dispatch(fetchWorkOrder(workOrderId)),
        dispatch(fetchWorkOrderNotes(workOrderId)),
      ]);

      this.setState({ loading: false });
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message,
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isChangedNotesStates = !isEqual(this.props.notesStates, nextProps.notesStates);
    const isChangedWorkorder = !isEqual(this.props.workOrder, nextProps.workOrder);
    const isChangedNotes = !isEqual(this.props.notes, nextProps.notes);
    const isChangedWorkorderId =
      this.props.match.params.workOrderId !== nextProps.match.params.workOrderId;
    const isChangedState = !isEqual(this.state, nextState);

    return (
      isChangedState ||
      isChangedNotesStates ||
      isChangedNotes ||
      isChangedWorkorderId ||
      isChangedWorkorder
    );
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    // dispatch(forgetWorkOrder());
    dispatch(forgetWorkOrderNotes());
  }

  print() {
    window.print();
  }

  renderPageFooter(page, total) {
    return (
      <footer className="page-footer">
        <div className="footer-inner">
          <img className="footer-logo" alt="starlight logo" src={logo} />
          <p className="footer-pagination">{`page ${page} of ${total}`}</p>
        </div>
      </footer>
    );
  }

  // eslint-disable-next-line complexity
  renderSummaryPage(workOrder, notes, page, total) {
    return (
      <div className="print-page print-page--summary">
        <header className="page-header">
          <p className="page-date">{moment().format('dddd, Do MMMM')}</p>
          <h1 className="page-title">
            {workOrder.action} #{workOrder.id} SUMMARY
          </h1>
        </header>
        <div className="page-inner">
          <WorkOrderHistoryMap items={notes} disabled mapConfig={this.props.mapConfig} />
          <div className="details">
            <div className="details-column">
              <div className="details-group">
                <div className="details-item">
                  <h3>Contact Name</h3>
                  <p>{workOrder.contactName || 'N/A'}</p>
                </div>
                <div className="details-item">
                  <h3>Contact Phone</h3>
                  <p>{workOrder.contactNumber || 'N/A'}</p>
                </div>
                <div className="details-item">
                  <h3>Customer Name</h3>
                  <p>{workOrder.customerName || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="details-column">
              <div className="details-item">
                <h3>DRIVER NAME</h3>
                <p>{workOrder.driver.description || 'N/A'}</p>
              </div>
              <div className="details-item">
                <h3>TYPE / CAN SIZE</h3>
                <p>
                  {workOrder.action} / {workOrder.size}
                </p>
              </div>
              <div className="details-item">
                <h3>MATERIAL</h3>
                <p>{workOrder.material || 'N/A'}</p>
              </div>
            </div>
            <div className="details-column">
              <div className="details-item">
                <h3>SCHEDULED DATE & TIME</h3>
                <p>
                  {workOrder.scheduledDate
                    ? moment(workOrder.scheduledDate).format('MM/DD/YYYY')
                    : 'N/A'}
                </p>
                <p>
                  {workOrder.scheduledStart
                    ? moment(workOrder.scheduledStart, 'HH:mm:ss').format('h:mm a')
                    : 'N/A'}
                  {' - '}
                  {workOrder.scheduledEnd
                    ? moment(workOrder.scheduledEnd, 'HH:mm:ss').format('h:mm a')
                    : 'N/A'}
                </p>
              </div>
              <div className="details-item details-item--inline">
                <h3>HIGH PRIORITY:</h3>
                <p>{workOrder.priority ? 'YES' : 'NO'}</p>
              </div>
              <div className="details-item details-item--inline">
                <h3>NEGOTIATED FILL:</h3>
                <p>{workOrder.negotiatedFill ? 'YES' : 'NO'}</p>
              </div>
              <div className="details-item details-item--inline">
                <h3>PROFILE NUMBER:</h3>
                <p>{workOrder.profileNumber ? workOrder.profileNumber : 'N/A'}</p>
              </div>
              <div className="details-item details-item--inline">
                <h3>PO NUMBER:</h3>
                <p>{workOrder.poNumber ? workOrder.poNumber : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
        {this.renderPageFooter(page, total)}
      </div>
    );
  }

  renderDetailsPage(notes, page, total) {
    return (
      <div key={page} className="print-page print-page--details">
        <header className="page-header">
          <h2 className="page-title">WORK ORDER DETAILS</h2>
        </header>
        <div className="page-inner">
          <DataList className="datalist--history">
            {notes.sort(sortNotes).map((item) => (
              <WorkOrderHistoryNote
                key={item.id}
                data={item}
                timezone={
                  this.props.user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
                }
                notesStates={{
                  NOTE: 'NOTE',
                  MANIFEST: 'MANIFEST',
                  SCALETICKET: 'SCALETICKET',
                  TRANSITION: 'TRANSITION',
                }}
              />
            ))}
          </DataList>
        </div>
        {this.renderPageFooter(page, total)}
      </div>
    );
  }

  renderAttachmentPage(note, number, page, total) {
    return (
      <div key={page} className="print-page print-page--attachment">
        <header className="page-header">
          <h2 className="page-title">ADDENDUM #{number}</h2>
        </header>
        <div className="page-inner">
          <div className="datalist--history">
            <WorkOrderHistoryNote
              data={note}
              timezone={
                this.props.user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
              }
              notesStates={{
                NOTE: 'NOTE',
                MANIFEST: 'MANIFEST',
                SCALETICKET: 'SCALETICKET',
                TRANSITION: 'TRANSITION',
              }}
            />
          </div>
          <div className="attachment">
            <img src={note.note.picture} alt="work order note attachment" />
          </div>
        </div>
        {this.renderPageFooter(page, total)}
      </div>
    );
  }

  renderPages() {
    const { notes, workOrder, notesStates } = this.props;
    const allowedNotesStates = [
      notesStates.ARRIVE_ON_SITE,
      notesStates.START_SERVICE,
      notesStates.FINISH_SERVICE,
      notesStates.ARRIVE_AT_FILL,
      notesStates.ARRIVE_ON_SITE2,
      notesStates.WORK_ORDER_COMPLETE,
    ];
    const notesWithAttachments = R.filter(R.path(['note', 'picture']), notes);
    const notesForDetailsPage = R.splitEvery(14, notes);
    const notesForMap = notes.filter((item) => {
      const { location } = item.location;
      const isValidLocation = location && location.lat && location.lon;
      const hasState = item.note.newState;
      const isAllowedState = allowedNotesStates.indexOf(item.note.newState);

      return isValidLocation && hasState && isAllowedState;
    });

    let page = 1;
    const total = page + notesWithAttachments.length + notesForDetailsPage.length;

    return (
      <div>
        <header className="print-header">
          <button type="button" className="btn btn__success" onClick={this.print}>
            Print pages
          </button>
        </header>
        <div className="print-view">
          {this.renderSummaryPage(workOrder, notesForMap, page, total)}
          {notesForDetailsPage.map((notesx) => {
            page++;
            return this.renderDetailsPage(notesx, page, total);
          })}
          {notesWithAttachments.map((note, index) => {
            page++;
            const number = index + 1;
            return this.renderAttachmentPage(note, number, page, total);
          })}
        </div>
        <footer className="print-footer">
          <button type="button" className="btn btn__success" onClick={this.print}>
            Print pages
          </button>
        </footer>
      </div>
    );
  }

  render() {
    return (
      <div className="print print--workOrder">
        {this.state.loading && !this.state.error ? (
          <p className="loading">Loading...</p>
        ) : (
          this.renderPages()
        )}
        {this.state.error ? (
          <p className="loading loading--error">{this.state.error}</p>
        ) : null}
      </div>
    );
  }
}

export default WorkOrderPrint;
