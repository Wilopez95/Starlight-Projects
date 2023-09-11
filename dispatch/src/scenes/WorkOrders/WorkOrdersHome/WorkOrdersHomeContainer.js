import { connect } from 'react-redux';
import { createSelectFilteredWos, createSelectWosFilter } from '@root/state/modules/workOrders';
import WorkOrdersHome from './WorkOrdersHome';

const mapStateToProps = (state) => {
  const { setting } = state;
  const selectFilter = createSelectWosFilter();
  const selectFilteredWos = createSelectFilteredWos();
  return {
    workOrders: selectFilteredWos(state),
    setting,
    constants: state.constants,
    isLoading: state.workOrders.isLoading,
    active: state.workOrders.active,
    filter: selectFilter(state),
  };
};

export default connect(mapStateToProps)(WorkOrdersHome);
