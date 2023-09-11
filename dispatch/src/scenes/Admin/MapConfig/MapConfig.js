/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { fetchSettingByKey, updateSetting } from '@root/state/modules/settings';
import Form from '@root/forms/EditMapConfig';
import { selectWaypoints, fetchWaypointsIfNeeded } from '@root/state/modules/locations';
import AdminView from '@root/scenes/Admin/components/Layout/AdminView';

// export type Props = {
//   fetchSettingByKey: string => Object,
//   fetchWaypointsIfNeeded: () => void,
//   updateSetting: Object => void,
//   setting: Object,
//   waypoints: Array<Object>,
// };
export class MapConfig extends PureComponent {
  static defaultProps = {
    setting: {},
  };

  componentDidMount() {
    this.props.fetchWaypointsIfNeeded();
  }

  handleUpdateSetting = async (data) => {
    await this.props.updateSetting(data);
  };

  render() {
    return (
      <AdminView title="Map Settings">
        <Helmet title="Map Settings" />
        <Form
          mapConfig={this.props.setting.map}
          onUpdateSetting={this.handleUpdateSetting}
          locations={this.props.waypoints}
        />
      </AdminView>
    );
  }
}

const mapStateToProps = (state) => ({
  setting: state.setting,
  waypoints: selectWaypoints(state),
});

const mapDispatchToProps = (dispatch) => ({
  fetchSettingByKey: (key, businessUnitId) => dispatch(fetchSettingByKey(key, businessUnitId)),
  updateSetting: (data) => dispatch(updateSetting(data)),
  fetchWaypointsIfNeeded: () => dispatch(fetchWaypointsIfNeeded()),
});

export default connect(mapStateToProps, mapDispatchToProps)(MapConfig);
