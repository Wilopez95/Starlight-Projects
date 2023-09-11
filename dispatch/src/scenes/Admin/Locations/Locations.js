import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import AdminView from '@root/scenes/Admin/components/Layout/AdminView';
import CreateLocation from '@root/forms/CreateLocation';
import { Paths } from '@root/routes/routing';

// type Props = {
//   fetchSettingByKey: string => void,
//   createLocation: Object => void,
//   history: History,
//   isLoading: boolean,
//   mapConfig: Object,
//   locations: Array<LocationType>,
//   fetchWaypointsIfNeeded: () => void,
// };

export class Locations extends PureComponent {
  static propTypes = {
    fetchSettingByKey: PropTypes.func.isRequired,
    fetchWaypointsIfNeeded: PropTypes.func.isRequired,
    createLocation: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    mapConfig: PropTypes.object.isRequired,
    locations: PropTypes.array.isRequired,
  };

  componentDidMount() {
    this.props.fetchSettingByKey('map');
    this.props.fetchWaypointsIfNeeded();
  }

  handleCreateLocation = (data) => {
    this.props.createLocation(data);
  };

  onDismiss = () => {
    this.props.history.push(Paths.Drivers);
  };

  render() {
    return (
      <AdminView title="Locations" isLoading={this.props.isLoading}>
        <CreateLocation
          entity="locations"
          isLoading={this.props.isLoading}
          mapConfig={this.props.mapConfig}
          onCreateLocation={this.handleCreateLocation}
          onDismiss={this.onDismiss}
          locations={this.props.locations}
        />
      </AdminView>
    );
  }
}
