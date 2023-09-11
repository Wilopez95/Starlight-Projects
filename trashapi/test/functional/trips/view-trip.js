import assert from 'assert';
import { invalid, notFound } from '../common';
import { expect } from '../../helpers/request';
import { clear } from '../../helpers/data';
import trips from '../../../src/tables/trips';
import drivers from '../../../src/tables/drivers';
import { my } from '../../../src/utils/query';
import { createTrucksDriversTrips } from '../../helpers/trips';

export const before = createTrucksDriversTrips(1);

export const after = clear;

export default {
  async success(request) {
    const [trip] = await my(trips.select());
    const { body: trip2 } = await expect(
      200,
      request({
        tripId: trip.id,
      }),
    );
    // const [trip2] = body;
    assert.equal(trip.id, trip2.id, 'check trip id');
    assert.equal(trip.tripType, trip2.tripType, 'check trip type');
    assert.equal(trip.driverId, trip2.driver.id, 'check driver id');
  },
  notFound: notFound(drivers, 'tripId', 'id'),
  invalid: invalid('tripId'),
};
