import assert from 'assert';
import { invalid } from '../common';
import { clear } from '../../helpers/data';
import trips from '../../../src/tables/trips';
import { my } from '../../../src/utils/query';
import { createTrucksDriversTrips } from '../../helpers/trips';

export const before = createTrucksDriversTrips(1);

export const after = clear;

export default {
  async success(request) {
    const [trip] = await my(trips.select());
    await request({ tripId: trip.id }).expect(204);
    const [trip2] = await my(trips.select().where({ id: trip.id }));
    assert(trip2.deleted === 1);
  },
  notFound: async request => {
    await request({ tripId: '456748' }).expect(204);
  },
  invalid: invalid('tripId'),
};
