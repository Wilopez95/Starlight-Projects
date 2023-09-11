import { connect } from 'react-redux';
import {
  createLocation,
  selectWaypoints,
  fetchWaypointsIfNeeded,
} from '@root/state/modules/locations';
import { fetchSettingByKey } from '@root/state/modules/settings';
import { extractValuesForSelect } from '@root/utils/extractValuesForSelect';
import constants from '@root/helpers/constants.json';
import { Locations } from './Locations';

const mapStateToProps = (state) => {
  const { type, waypointType } = constants.location;
  return {
    isLoading: state.setting.isLoading,
    types: extractValuesForSelect(type),
    waypointTypes: extractValuesForSelect(waypointType),
    mapConfig: state.setting.map,
    locations: selectWaypoints(state),
  };
};

const mapDispatchToProps = (dispatch) => ({
  fetchSettingByKey: (key = 'map') => dispatch(fetchSettingByKey(key)),
  createLocation: (payload) => dispatch(createLocation(payload)),
  fetchWaypointsIfNeeded: () => dispatch(fetchWaypointsIfNeeded()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Locations);
