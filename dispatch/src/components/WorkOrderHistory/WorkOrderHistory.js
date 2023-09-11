/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import moment from 'moment';

// Actions
import {
  fetchWorkOrderNotes,
  forgetWorkOrderNotes,
  createSelectWoNotesLoading,
  createSelectWoNotes,
} from '@root/state/modules/workOrderNotes';

import WorkOrderHistoryNote from '../WorkOrderHistoryNote';
import WorkOrderHistoryMap from '../WorkOrderHistoryMap';
import DataList from '../DataList';
import FormAddNote from '../../forms/WorkOrderAddNote';
import FormSetState from '../../forms/WorkOrderSetState';

export const sortItems = R.comparator((a, b) => {
  const momentA = moment(a.createdDate);
  const momentB = moment(b.createdDate);
  return momentA.isAfter(momentB);
});

// export type Props = {
//   woNotes: Array<WorkOrderNoteType>,
//   isLoading: boolean,
//   fetchWorkOrderNotes: (workOrderId: number) => void,
//   forgetWorkOrderNotes: () => void,
//   timezone: string,
//   workOrderId: number,
//   mapConfig: MapConfigType,
// };

class WorkOrderHistory extends PureComponent {
  componentDidMount() {
    const { fetchWorkOrderNotes, workOrderId } = this.props;

    fetchWorkOrderNotes(workOrderId);
  }

  componentWillUnmount() {
    this.props.forgetWorkOrderNotes();
  }

  render() {
    const {
      workOrderId,
      mapConfig,
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
      isLoading,
      woNotes,
    } = this.props;
    const loading = isLoading && woNotes.length === 0;

    return (
      <div className="history history--workorder">
        <div className="history-main">
          <DataList className="datalist--history" loading={loading}>
            {woNotes
              ? woNotes.sort(sortItems).map((item) => (
                  <WorkOrderHistoryNote
                    key={item.id}
                    data={item}
                    timezone={timezone}
                    notesStates={{
                      NOTE: 'NOTE',
                      MANIFEST: 'MANIFEST',
                      SCALETICKET: 'SCALETICKET',
                      TRANSITION: 'TRANSITION',
                    }}
                  />
                ))
              : null}
          </DataList>
          <FormSetState workOrderId={workOrderId} />
          <FormAddNote workOrderId={workOrderId} />
        </div>
        <div className="history-aside">
          {mapConfig.lon && !isLoading ? (
            <WorkOrderHistoryMap items={woNotes} mapConfig={mapConfig} />
          ) : null}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const selectIsLoading = createSelectWoNotesLoading();
  const selectWoNotes = createSelectWoNotes();
  return {
    woNotes: selectWoNotes(state),
    isLoading: selectIsLoading(state),
    mapConfig: state.setting.map,
  };
};

const mapDispatchToProps = (dispatch) => ({
  forgetWorkOrderNotes: () => dispatch(forgetWorkOrderNotes()),
  fetchWorkOrderNotes: (workOrderId) => dispatch(fetchWorkOrderNotes(workOrderId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkOrderHistory);
