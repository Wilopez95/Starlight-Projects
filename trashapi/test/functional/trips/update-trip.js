import assert from 'assert';
import constants from '../../../src/utils/constants';
import { notFound, invalid } from '../common';
import { expect, body } from '../../helpers/request';
import { clear } from '../../helpers/data';
import locations from '../../../src/tables/locations';
import trips from '../../../src/tables/trips';
import { my } from '../../../src/utils/query';
import { createTrucksDriversTrips } from '../../helpers/trips';

const {
  trip: {
    tripType: { PRE_TRIP },
  },
} = constants;

export const before = createTrucksDriversTrips(1);

export const after = clear;

export default {
  '- update trip': async request => {
    const [tripBefore] = await my(trips.select());
    assert(tripBefore);

    const tripAfter = await body(
      expect(
        202,
        request({ tripId: tripBefore.id }).send({ tripType: PRE_TRIP }),
      ),
    );

    assert(tripAfter);

    assert.equal(tripAfter.tripType, PRE_TRIP, 'test changing tripType');
  },
  'not found': notFound(locations, 'tripId', 'id'),

  invalid: invalid('tripId'),
};
