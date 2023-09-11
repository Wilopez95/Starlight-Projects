import { connect } from 'react-redux';
import { getCanFilter, getCansLoading, selectCansList } from '@root/state/modules/cans';
import { selectCurrentUser } from '@root/state/modules/session';
import {
  labelAndValueExtractor,
  labelAndValueExtractorAvoidingDots,
} from '@root/helpers/functions';
import Inventory from './Inventory';

const mapStateToProps = (state) => {
  const {
    setting,
    constants: {
      can: { action, size },
    },
  } = state;
  // const selectFiltered = selectFilteredCans();
  const selectCans = selectCansList();
  return {
    cans: selectCans(state),
    refreshCans: state.cans.refreshCans,
    activeCan: state.cans.activeCan,
    errorOnTransactionsFetch: state.cans.errorOnTransactionsFetch,
    filter: getCanFilter(state),
    isLoading: getCansLoading(state),
    statuses: Object.keys(action).map(labelAndValueExtractor),
    setting,
    sizes: size.map(labelAndValueExtractorAvoidingDots),
    user: selectCurrentUser(state),
  };
};

export default connect(mapStateToProps)(Inventory);
