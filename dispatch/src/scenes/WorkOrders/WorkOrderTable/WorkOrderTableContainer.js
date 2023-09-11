import { connect } from 'react-redux';
import { labelAndValueExtractor } from '@root/helpers/functions';
import { selectCurrentUser } from '@root/state/modules/session';
import { createSelectFilteredWos, createSelectWosFilter } from '@root/state/modules/workOrders';
import WorkOrderTable from './WorkOrderTable';

const mapStateToProps = (state) => {
  const {
    constants: {
      workOrder: { material, action, status },
      can: { size },
    },
  } = state;

  const filterByPrefix = (item) => !(item.indexOf('WS:') === 0 || item.indexOf('SL:') === 0);
  const selectFilteredWos = createSelectFilteredWos();
  const selectFilter = createSelectWosFilter();
  return {
    workOrders: selectFilteredWos(state),
    filter: selectFilter(state),
    isLoading: state.workOrders.isLoading,
    user: selectCurrentUser(state),
    sizes: size.map(labelAndValueExtractor),
    materials: material.filter(filterByPrefix).map(labelAndValueExtractor),
    actions: Object.keys(action).map((key) => labelAndValueExtractor(action[key])),
    statuses: Object.keys(status).map((key) => labelAndValueExtractor(status[key])),
  };
};

export default connect(mapStateToProps)(WorkOrderTable);
