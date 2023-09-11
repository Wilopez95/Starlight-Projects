import assert from 'assert';
import R from 'ramda';
import constants from '../../../src/utils/constants';
import { expect } from '../../helpers/request';
import { clear } from '../../helpers/data';
import { createTrucksDriversTrips } from '../../helpers/trips';

const {
  // location: {
  //   type: {TRUCK}
  // },
  trip: {
    tripType: { PRE_TRIP, POST_TRIP },
  },
} = constants;

const driversNames = ['first', 'second', 'third', 'fourth', 'fifth'];

export const beforeEach = createTrucksDriversTrips(5);

export const after = clear;

const tripTypeChecker = ({ tripType }) =>
  R.contains(tripType, [PRE_TRIP, POST_TRIP]);

export default {
  async list(request) {
    const { body } = await expect(200, request());
    assert(R.is(Array, body));
    assert.equal(body.length, 5, '5 trips');
    const isCorrectTripTypes = body.every(tripTypeChecker);
    assert(isCorrectTripTypes, 'correct trip types');
  },
  async filterByTripType(request) {
    const resOfPreTrips = await expect(
      200,
      request().query({
        tripType: PRE_TRIP,
      }),
    );
    assert.equal(resOfPreTrips.body.length, 2, '2 PRE_TRIPS');
    const resOfPostTrips = await expect(
      200,
      request().query({
        tripType: POST_TRIP,
      }),
    );
    assert.equal(resOfPostTrips.body.length, 3, '3 POST_TRIPS');
  },
  'get deleted trips': async (request, api) => {
    const { body: origTrips } = await request().query();

    const [trip] = origTrips;

    await api.deleteTrip({ tripId: trip.id }).query();

    const { body: trips } = await request().query({
      driverId: trip.driver.id,
      tripType: trip.tripType,
      deleted: 1,
    });

    const deletedTrip = trips[0];

    assert.equal(deletedTrip.id, trip.id);
    assert.equal(deletedTrip.driver.id, trip.driver.id);
    assert.equal(deletedTrip.deleted, 1);
  },
  'get deleted trips with flag 0': async (request, api) => {
    const { body: origTrips } = await request().query();

    const [trip] = origTrips;

    await api.deleteTrip({ tripId: trip.id }).query();

    const { body: trips } = await request().query({
      deleted: 0,
    });

    assert.equal(origTrips.length - 1, trips.length);
  },
  async filterByDriverId(request) {
    const { body } = await expect(200, request().query({ driverId: 1 }));
    assert.equal(body.length, 1, '1 trip');
    const [{ driver }] = body;
    assert.equal(driver.name, driversNames[0], "driver's name");
  },
  async filterByDriverName(request) {
    const { body } = await expect(
      200,
      request().query({
        driverName: driversNames[1],
      }),
    );
    assert.equal(body.length, 1, '1 trip');
    const [{ driver }] = body;
    assert.equal(driver.name, driversNames[1], "driver's name");
  },
  'API-206 should search by trips by createdDate have high precise': async request => {
    const { body } = await expect(
      200,
      request().query({
        date: '1478584801000..1478606399000', // 2016-11-08 06:01:00..2016-11-08 11:59:59
      }),
    );
    assert.equal(body.length, 1, '1 trip');
    const [{ driver }] = body;
    assert.equal(driver.name, driversNames[3], "driver's name");
  },
  'API-206 should search by trips by createdDate return several values': async request => {
    const { body } = await expect(
      200,
      request().query({
        date: '1478577500000..1478606401000', // 2016-11-08 5:58:20..2016-11-08 12:01:40
      }),
    );
    assert.equal(body.length, 3, '3 trip');
  },
  'API-206 should search by trips by createdDate return 0 values if there is not any': async request => {
    const { body } = await expect(
      200,
      request().query({
        date: '1478604960000..1478605020000', // 2016-11-08 13:36:00..2016-11-08 13:37:00
      }),
    );
    assert.equal(body.length, 0, 'there are not trips');
  },
};
