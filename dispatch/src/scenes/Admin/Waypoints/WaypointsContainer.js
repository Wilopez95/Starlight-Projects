import { connect } from 'react-redux';
import {
  removeWaypoint,
  getLocationsLoading,
  fetchWaypointsIfNeeded,
  selectWaypoints,
} from '@root/state/modules/locations';
import Waypoints from './Waypoints';

const mapStateToProps = (state) => ({
  waypoints: selectWaypoints(state),
  isLoading: getLocationsLoading(state),
});

const mapDispatchToProps = (dispatch) => ({
  fetchWaypoints: () => dispatch(fetchWaypointsIfNeeded()),
  removeWaypoint: (id) => dispatch(removeWaypoint(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Waypoints);
