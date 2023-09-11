/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import { AdminView } from '@root/scenes/Admin/components';
import CreateWaypoint from '@root/forms/CreateWaypoint';

// type Props = {
//   fetchSettingByKey: string => void,
//   fetchWaypointsIfNeeded: () => Array<LocationType>,
//   updateWaypoint: (number, LocationType) => LocationType,
//   match: Match,
//   history: BrowserHistory,
//   isLoading: boolean,
//   location: LocationType,
//   createWaypoint: LocationType => LocationType,
//   types: Array<Params>,
//   waypointTypes: Array<Params>,
//   forgetLocation: () => void,
//   mapConfig: Object,
//   waypoints: Array<LocationType>,
// };

export default class WaypointEditor extends PureComponent {
  componentDidMount() {
    this.props.fetchSettingByKey('map');

    if (this.props.match.params.id) {
      this.props.fetchWaypointsIfNeeded();
    }
  }

  handleUpdateWaypoint = (id, data) => {
    this.props.updateWaypoint(id, data);
  };

  handleCreateWaypoint = (data) => {
    this.props.createWaypoint(data);
  };

  backToList = () => {
    this.props.history.push('/configuration/waypoints');
  };

  render() {
    const {
      match: {
        params: { id },
      },
    } = this.props;

    const action = id ? 'edit' : 'create';

    return (
      <AdminView title={`${action} Waypoint`} isLoading={this.props.isLoading}>
        <CreateWaypoint
          action={action}
          id={id}
          entity="waypoints"
          onSuccessSubmit={this.backToList}
          location={this.props.location}
          onDismiss={this.backToList}
          types={this.props.types}
          isLoading={this.props.isLoading}
          waypointTypes={this.props.waypointTypes}
          forgetLocation={this.props.forgetLocation}
          locations={this.props.waypoints}
          mapConfig={this.props.mapConfig}
          onUpdateWaypoint={this.handleUpdateWaypoint}
          onCreateWaypoint={this.handleCreateWaypoint}
        />
      </AdminView>
    );
  }
}
