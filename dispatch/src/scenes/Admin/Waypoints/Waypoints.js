/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import { Helmet } from 'react-helmet';
import Table from '@root/scenes/Admin/components/Table';
import { AdminView } from '@root/scenes/Admin/components';

// type Props = {
//   fetchWaypoints: () => void,
//   removeWaypoint: number => void,
//   isLoading: boolean,
//   waypoints: Array<LocationType>,
// };

export default class Waypoints extends PureComponent {
  static defaultProps = {
    waypoints: [],
  };

  componentDidMount() {
    this.props.fetchWaypoints();
  }

  onDelete(entityId) {
    // eslint-disable-next-line
    if (confirm("Are you sure?")) {
      this.props.removeWaypoint(entityId);
    }
  }

  render() {
    const { waypoints, isLoading } = this.props;
    const columns = [
      {
        Header: 'ID',
        width: 50,
        accessor: 'id',
      },
      {
        Header: 'Waypoint Name',
        width: 200,
        accessor: 'description',
      },
      {
        Header: 'Waypoint Type',
        accessor: 'waypointType',
      },
      {
        Header: 'Location Name',
        accessor: 'name',
      },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: (row) => <span>{row.value ? row.value : '_'}</span>,
      },
      {
        Header: 'Coordinates',
        accessor: `location`,
        Cell: (row) => <span>{row.value ? `${row.value.lat}, ${row.value.lon}` : '_'}</span>,
      },
    ];
    return (
      <>
        <Helmet title="Waypoints" />
        <AdminView title="Waypoints" isLoading={this.props.isLoading}>
          <Table data={waypoints} columns={columns} loading={isLoading} defaultPageSize={20} />
        </AdminView>
      </>
    );
  }
}
