/* eslint-disable react/prop-types */

import { Component } from 'react';
import { Tooltip } from 'react-tippy';
import styled from 'styled-components';

import { AdminView } from '@root/scenes/Admin/components';
import EditDriverTripsForm from '@root/scenes/Admin/components/EditDriverTripsForm';
import Card from '@root/components/Card';

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
//   fetchDriverHaulsData: Function,
//   fetchDriverTimecardData: Function,
//   fetchDriverTripsData: Function,
//   updateDriverTrips: Function,
//   match: Match,
//   driverData: Array<Object>,
//   trips: Array<Object>,
// };

class EditTrips extends Component {
  componentDidMount() {
    this.props.fetchDriverHaulsData();
    this.props.fetchDriverTimecardData();
    this.props.fetchDriverTripsData();
  }

  updateDriverTrips = (data) => {
    const { id } = this.props.match.params;
    this.props.updateDriverTrips(id, data);
  };

  render() {
    const { driverData, trips } = this.props;

    return (
      <AdminView title="Edit Trips">
        <div className="row" style={{ marginTop: '50px' }}>
          <div className="col-sm-12 col-md-12">
            <Card>
              <TitleArea>
                <Tooltip title="Edit driver trip information. " position="top" trigger="click">
                  <CardTitle>
                    Edit Driver Trips Information{' '}
                    <i className="far fa-info-circle fa-xs" style={{ toolTips }} />
                  </CardTitle>
                </Tooltip>
              </TitleArea>
              <EditDriverTripsForm
                driverData={driverData}
                trips={trips}
                updateDriverTrips={this.updateDriverTrips}
              />
            </Card>
          </div>
        </div>
      </AdminView>
    );
  }
}
export default EditTrips;
