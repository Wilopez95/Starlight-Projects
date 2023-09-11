import assert from 'assert';
import R, { pipeP as pipe } from 'ramda';
import cans from '../../../src/tables/cans';
import locations from '../../../src/tables/locations';
import transactions from '../../../src/tables/transactions';
import { my, one } from '../../../src/utils/query';
import constants from '../../../src/utils/constants';
import mockCan from '../../fixtures/can';
import mockLocation from '../../fixtures/location';
import { up, down } from '../../helpers/data';
import {
  pipeline,
  notFound,
  invalid,
  invalidTransaction,
  afterTransaction,
} from '../common';

const {
  location: {
    type: { LOCATION, TRUCK, WAYPOINT },
  },
  can: {
    action: { MOVE },
  },
} = constants;

export const beforeEach = pipe(
  up(cans)(mockCan({ name: 'no location' })),
  up(locations)(R.times(() => mockLocation(LOCATION), 2)),
  up(locations)(mockLocation(TRUCK)),
  up(locations)(mockLocation(WAYPOINT)),
  down(transactions),
);

export const afterEach = afterTransaction;

const getCan = id => one(cans.select().where({ id }));
const getTransactions = () => my(transactions.select());

export default {
  async success(request) {
    const locs = await my(
      locations
        .select()
        .where(
          locations.type.equals(LOCATION).or(locations.type.equals(WAYPOINT)),
        ),
    );
    const can = await one(cans.select().where({ name: 'no location' }));
    const listOfTransactions = await getTransactions();
    const { id } = can;

    assert.equal(
      listOfTransactions.length,
      0,
      'there should not be any transaction in the system yet',
    );
    assert(!can.location, 'as well as a can should not have a location');

    await R.reduce(
      (prev, location) =>
        prev.then(async i => {
          await request({ canId: id })
            .send(location)
            .expect(204);

          const can = await getCan(id);
          const listOfTransactions = await getTransactions();

          assert.equal(listOfTransactions.length, i + 1);
          assert.deepEqual(
            can.locationId,
            location.id,
            'can should be pointed to the current location',
          );
          assert.equal(can.action, MOVE);

          assert.equal(listOfTransactions[i].locationId2, location.id);
          assert.equal(listOfTransactions[i].action, MOVE);
          assert.equal(listOfTransactions[i].canId, id);
          switch (i) {
            case 0:
              assert(
                !listOfTransactions[i].locationId1,
                'there was no any location, this can came from nowhere',
              );
              break;

            case 1:
              assert.equal(listOfTransactions[i].locationId1, locs[i - 1].id);
              break;

            default:
              break;
          }

          return i + 1;
        }),
      Promise.resolve(0),
      locs,
    );
  },

  'wrong location': async (request, api) => {
    const { body: can } = await api.createCan().send({
      ...mockCan({ name: 'wrong location' }),
      location: mockLocation(TRUCK, false),
    });
    await request({ canId: can.id })
      .send(mockLocation(LOCATION, false))
      .expect(409);
  },

  'move from null to null location': async (request, api) => {
    const { body: can } = await api.createCan().send({
      ...mockCan({ name: 'wrong location' }),
      location: {},
    });
    await request({ canId: can.id })
      .send({})
      .expect(204);
  },

  'not found': notFound(cans, 'canId', 'id'),
  invalid: pipeline(invalid('canId'), invalidTransaction(TRUCK)),
};
