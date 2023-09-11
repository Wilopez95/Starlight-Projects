import { connect } from 'react-redux';
import {
  createWaypoint,
  forgetLocation,
  updateWaypoint,
  fetchWaypointsIfNeeded,
  getLocationsLoading,
  selectWaypointById,
  selectWaypoints,
} from '@root/state/modules/locations';
import { fetchSettingByKey } from '@root/state/modules/settings';
import { extractValuesForSelect } from '@root/utils/extractValuesForSelect';
import constants from '@root/helpers/constants.json';
import WaypointEditor from './WaypointEditor';

const mapStateToProps = (state, ownProps) => {
  const { type, waypointType } = constants.location;

  return {
    isLoading: getLocationsLoading(state),
    location: ownProps.match.params.id
      ? selectWaypointById(state, ownProps.match.params.id)
      : { name: '' },
    types: extractValuesForSelect(type),
    waypointTypes: extractValuesForSelect(waypointType),
    mapConfig: state.setting.map,
    waypoints: selectWaypoints(state),
  };
};

const mapDispatchToProps = (dispatch) => ({
  fetchSettingByKey: (key = 'map') => dispatch(fetchSettingByKey(key)),
  fetchWaypointsIfNeeded: () => dispatch(fetchWaypointsIfNeeded()),
  createWaypoint: (payload) => dispatch(createWaypoint(payload)),
  forgetLocation: () => dispatch(forgetLocation()),
  updateWaypoint: (id, data) => dispatch(updateWaypoint(id, data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(WaypointEditor);
