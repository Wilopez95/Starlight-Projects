import { connect } from 'react-redux';
import { selectCurrentUser } from '@root/state/modules/session';
import WorkOrderPrint from './WorkOrderPrint';

const mapStateToProps = (state) => {
  const { workOrders, workOrderNotes, constants } = state;

  return {
    workOrder: workOrders.single,
    notes: workOrderNotes.list,
    notesStates: constants.workOrder.note.transitionState,
    mapConfig: state.setting.map,
    user: selectCurrentUser(state),
  };
};

export default connect(mapStateToProps)(WorkOrderPrint);
