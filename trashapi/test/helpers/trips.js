import R from 'ramda';
import { format } from 'date-fns';
import mockLocation from '../fixtures/location';
import constants from '../../src/utils/constants';
import trips from '../../src/tables/trips';
import locations from '../../src/tables/locations';
import drivers from '../../src/tables/drivers';
import { my } from '../../src/utils/query';
import { clear, isOdd } from './data';

const {
  location: {
    type: { TRUCK },
  },
  trip: {
    tripType: { PRE_TRIP, POST_TRIP },
  },
} = constants;

const driversNames = ['first', 'second', 'third', 'fourth', 'fifth'];
const createdAtDates = [
  // 2016-11-08 14:00:00"
  1478606400000,
  // "2016-11-9 12:00:00"
  1478606893000,
  // "2016-11-7 08:00:00"
  1478505600000,
  // "2016-11-08 06:00:01"
  1478584801000,
  // "2016-11-08 05:59:59"
  1478584799000,
];
const odometers = [1.5, 2.3, 2.5, 3.4, 5];

export const createTrucksDriversTrips = xTimes =>
  R.pipeP(clear, async () => {
    // create 2 locations (trucks)
    await my(locations.insert(R.times(() => mockLocation(TRUCK), 2)));

    // get list of trucks
    const listOfTrucks = await my(locations.select().where({ type: TRUCK }));

    // prepare 5 drivers
    const driversToInsert = R.times(
      i => ({
        name: driversNames[i],
        truckId: (isOdd(i) ? R.head(listOfTrucks) : R.last(listOfTrucks)).id,
      }),
      xTimes,
    );

    // create drivers
    await my(drivers.insert(driversToInsert));

    // get list of trucks
    const listOfDrivers = await my(drivers.select());

    // prepare 5 trips
    const tripsToInsert = R.times(
      i => ({
        truckId: (isOdd(i) ? R.head(listOfTrucks) : R.last(listOfTrucks)).id,
        driverId: listOfDrivers[i].id,
        createdBy: driversNames[i],
        createdDate: format(createdAtDates[i], 'YYYY-MM-DD HH:mm:ss'),
        modifiedBy: driversNames[i],
        tripType: isOdd(i) ? PRE_TRIP : POST_TRIP,
        odometer: odometers[i],
      }),
      xTimes,
    );

    // create trips
    await my(trips.insert(tripsToInsert));
  });
