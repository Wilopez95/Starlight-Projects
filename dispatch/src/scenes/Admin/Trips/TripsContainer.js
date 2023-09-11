import { connect } from 'react-redux';
import {
  fetchDriverHaulsData,
  fetchDriverTimecardData,
  fetchDriverTripsData,
  updateDriverHauls,
  updateDriverTrips,
} from '@root/state/modules/driverhauls';
import Trips from './Trips';

const mapStateToProps = (state) => ({
  driverData: state.driverhauls.allResults,
  timecard: state.driverhauls.timecardResults,
  trips: state.driverhauls.tripsResults,
  setting: state.setting,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

const mapDispatchToProps = (dispatch) => ({
  fetchDriverHaulsData: () => dispatch(fetchDriverHaulsData()),
  fetchDriverTimecardData: () => dispatch(fetchDriverTimecardData()),
  fetchDriverTripsData: () => dispatch(fetchDriverTripsData()),
  updateDriverHauls: (id, formInput) => dispatch(updateDriverHauls(id, formInput)),
  updateDriverTrips: (id, formInput) => dispatch(updateDriverTrips(id, formInput)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Trips);
