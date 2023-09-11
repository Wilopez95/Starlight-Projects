/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import { connect } from 'react-redux';

// Actions
import {
  fetchWorkOrderNotes,
  forgetWorkOrderNotes,
  createSelectWoNotesLoading,
  createSelectWoNotes,
} from '@root/state/modules/workOrderNotes';
import WorkOrderRouteMap from '../WorkOrderRouteMap';

// export type Props = {
//   woNotes: Array<WorkOrderNoteType>,
//   isLoading: boolean,
//   fetchWorkOrderNotes: (workOrderId: number) => void,
//   forgetWorkOrderNotes: () => void,

//   workOrderId: number,
//   mapConfig: MapConfigType,
// };

class WorkOrderRoute extends PureComponent {
  componentDidMount() {
    const { fetchWorkOrderNotes, workOrderId } = this.props;

    fetchWorkOrderNotes(workOrderId);
  }

  componentWillUnmount() {
    this.props.forgetWorkOrderNotes();
  }

  render() {
    const { mapConfig, isLoading, woNotes } = this.props;

    return (
      <div className="history history--workorder">
        <div className="history-aside">
          {mapConfig.lon && !isLoading ? (
            <WorkOrderRouteMap items={woNotes} mapConfig={mapConfig} />
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

export default connect(mapStateToProps, mapDispatchToProps)(WorkOrderRoute);
