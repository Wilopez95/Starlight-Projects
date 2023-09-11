import { connect } from 'react-redux';
import {
  fetchDriverHaulsData,
  fetchDriverTimecardData,
  fetchDriverTripsData,
  updateDriverTrips,
} from '@root/state/modules/driverhauls';

import EditTrips from './EditTrips';

const mapStateToProps = (state) => ({
  driverData: state.driverhauls.allResults,
  timecard: state.driverhauls.timecardResults,
  trips: state.driverhauls.tripsResults,
});

const mapDispatchToProps = (dispatch) => ({
  fetchDriverHaulsData: () => dispatch(fetchDriverHaulsData()),
  fetchDriverTimecardData: () => dispatch(fetchDriverTimecardData()),
  fetchDriverTripsData: () => dispatch(fetchDriverTripsData()),
  updateDriverTrips: (id, formInput) => dispatch(updateDriverTrips(id, formInput)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditTrips);
