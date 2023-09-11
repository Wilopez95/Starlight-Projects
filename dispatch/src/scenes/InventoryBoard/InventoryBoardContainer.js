/* eslint-disable array-callback-return */
import { connect } from 'react-redux';
import { fetchConstantsIfNeeded } from '@root/state/modules/constants';
import { fetchHauls, fetchCansAtWaypoints, fetchCansOnTrucks } from '@root/state/modules/invboard';
import InventoryBoardLayout from './InventoryBoardLayout';

const mapStateToProps = (state) => ({
  canSizes: state.constants.can.size,
  // ALL work orders filtered out NOT DROP OFF, PICK UP, CANCELED, OR ME ELECTRIC
  workorders: state.invboard.hauls.workorders,
  // ALL SPOT work orders
  currentInventory: state.invboard.hauls.currentInventory,
  // ALL SPOT work orders
  endingInventory: state.invboard.hauls.endingInventory,
  // ALL FINAL work orders
  finals: state.invboard.hauls.finals,
  tallyOnTruckSizes: state.invboard.hauls.tallyOnTruckSizes,
  cansOnTrucksTally: state.invboard.inventory.cansOnTrucksTally,
  tallySizes: state.invboard.inventory.tallySizes,
});

export default connect(mapStateToProps, {
  fetchConstantsIfNeeded,
  fetchHauls,
  fetchCansAtWaypoints,
  fetchCansOnTrucks,
})(InventoryBoardLayout);
