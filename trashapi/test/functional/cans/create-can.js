import assert from 'assert';
import R, { pipeP as pipe } from 'ramda';
import { format } from 'date-fns';
import { expect } from '../../helpers/request';
import cans from '../../../src/tables/cans';
import locations from '../../../src/tables/locations';
import transactions from '../../../src/tables/transactions';
import { my, one } from '../../../src/utils/query';
import constants from '../../../src/utils/constants';
import mockCan from '../../fixtures/can';
import mockLocation from '../../fixtures/location';
import { down, toUTC } from '../../helpers/data';

const {
  can: {
    action: { CREATE },
  },
  location: {
    type: { LOCATION, WAYPOINT },
  },
} = constants;

const clean = pipe(down(transactions), down(cans), down(locations));

export const beforeEach = clean;
export const afterEach = clean;

const checkCount = async (cansCount, locationsCount, transactionsCount) => {
  assert.equal(R.length(await my(cans.select())), cansCount);
  assert.equal(R.length(await my(locations.select())), locationsCount);
  assert.equal(R.length(await my(transactions.select())), transactionsCount);
};

const checkTransactions = async can => {
  const transaction = await one(transactions.select());
  assert.equal(transaction.action, CREATE);
  assert.equal(transaction.canId, can.id);
  if (can.locationId) {
    assert.equal(transaction.locationId2, can.locationId);
  }
  assert.equal(can.transactions[0].id, transaction.id);
};

const utilFields = ['createdBy', 'createdDate', 'modifiedBy', 'modifiedDate'];

const cleanBodyFields = R.pipe(
  R.over(R.lensProp('location'), R.omit(['id', 'waypointType', ...utilFields])),
  R.omit(['id', 'timestamp', 'action', 'prevLocation', ...utilFields]),
);

const cleanDbFields = R.pipe(
  R.over(R.lensProp('location'), R.omit(['seedName', 'waypointType', 'deleted'])),
  toUTC('startDate'),
);

const canSeed = (address = 'ul. Lenina, 23, Omsk') => ({
  ...mockCan(),
  location: {
    type: LOCATION,
    // this address, because we already have it in our
    // test/fixtures/geo-responses.json:2
    name: address,
    geocoding: true,
  },
});

export default {
  async noLocation(request) {
    const can = mockCan();

    const { body } = await expect(201, request().send(can));
    assert(R.is(Object, body));
    assert.deepEqual(
      R.omit(['location'], cleanDbFields(can)),
      R.omit(['location', 'transactions'], cleanBodyFields(body)),
    );
    assert.equal(body.action, CREATE);

    await checkCount(1, 0, 1);
    await checkTransactions(body);
  },

  async location(request) {
    const can = mockCan();
    can.location = mockLocation(LOCATION, false);

    const { body } = await expect(201, request().send(can));
    assert.deepEqual(cleanDbFields(can), R.omit(['transactions'], cleanBodyFields(body)));
    assert.equal(body.action, CREATE);

    await checkCount(1, 1, 1);
    await checkTransactions(body);
  },

  async locationWithGeocoding(request) {
    const can = mockCan();
    can.location = {
      ...mockLocation(WAYPOINT, false, '', 'Type', 'Name'),
      // this addres, because we already have it in our
      // test/fixtures/geo-responses.json:1815
      name: '1090 Cherokee St, Denver, CO',
      geocoding: true,
    };

    const { body } = await expect(201, request().send(can));
    assert.equal(body.location.type, can.location.type);
    assert.equal(body.location.waypointType, can.location.waypointType);
    assert.equal(body.location.waypointName, can.location.waypointName);
  },

  async locationSeedsDuplicates(request) {
    await expect(201, request().send(canSeed()));

    await expect(
      201,
      request().send(canSeed("ul. Lenina, 23, Omsk, Omskaya oblast', Russia, 644024")),
    );

    const locs = await my(locations.select());
    assert.equal(locs.length, 1);
  },

  async invalid(request) {
    await expect(400, request().send([]));
  },
  async error(request) {
    await expect(500, request().send({ id: -1 }));
  },
  'API-224 timestamp should be changed on update': async () => {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    await my(
      await cans.insert({
        ...mockCan(),
        timestamp,
      }),
    );
    const [createdCan] = await my(cans.select());
    assert.equal(timestamp, format(createdCan.timestamp, 'yyyy-MM-dd HH:mm:ss'));
  },
};
