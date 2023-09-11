/* eslint-disable react/prop-types */

import { Component } from 'react';
import { Tooltip } from 'react-tippy';
import styled from 'styled-components';

import { Helmet } from 'react-helmet';
import { AdminView } from '@root/scenes/Admin/components';
import Card from '@root/components/Card';
import TripsTable from '@root/scenes/Admin/Trips/TripsTable';
import { Loader } from '@root/components/index';

const toolTips = {
  size: '2rem',
  fontSize: '0.7rem',
  float: top,
  marginTop: '-23px',
  marginBottom: '8px',
};

const TitleArea = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 20px;
  /* margin-bottom: 10px; */
`;

const CardTitle = styled.h4`
  font-size: 1.05em;
  font-weight: 700;
  padding-left: 14px;
`;
// type Props = {
//   updateDriverHauls: Function,
//   fetchDriverTripsData: Function,
//   updateDriverTrips: Function,
//   match: Match,
//   timezone: string,
//   trips: Array<Object>,
// };

class Trips extends Component {
  componentDidMount() {
    this.props.fetchDriverTripsData();
  }

  _handleEditDriverTimecard = (data) => {
    const { id } = this.props.match.params;
    this.props.updateDriverHauls(id, data);
  };

  updateDriverTrips = (data) => {
    const { id } = this.props.match.params;
    this.props.updateDriverTrips(id, data);
  };

  render() {
    const {
      trips,
      setting: { isLoading },
    } = this.props;
    return (
      <AdminView title="Driver Trips">
        <Helmet title="Driver Trips" />
        {isLoading ? (
          <Loader />
        ) : (
          <Card>
            <TitleArea>
              <Tooltip
                title="Edit the driver trips for the specific days. "
                position="top"
                trigger="click"
              >
                <CardTitle>
                  Edit Driver Trip Entries{' '}
                  <i className="far fa-info-circle fa-xs" style={{ toolTips }} />
                </CardTitle>
              </Tooltip>
            </TitleArea>
            <TripsTable
              trips={trips}
              timezone={this.props.timezone}
              updateDriverTrips={this.updateDriverTrips}
            />
          </Card>
        )}
      </AdminView>
    );
  }
}

export default Trips;
