/* eslint new-cap: 0 */
import assert from 'assert';
import R, { pipeP as pipe, compose as o } from 'ramda';
import { expect } from '../../helpers/request';
import mockCan from '../../fixtures/can';
import mockLocation from '../../fixtures/location';
import { my } from '../../../src/utils/query';
import { up, clear } from '../../helpers/data';
import locations from '../../../src/tables/locations';
import constants from '../../../src/utils/constants';
import { foldP } from '../../../src/utils/functions';
import locationView from '../../../src/views/location';

const {
  location: { type },
} = constants;
const { LOCATION, TRUCK, WAYPOINT } = type;

const pointFromTextToObj = R.over(
  R.lensProp('location'),
  o(
    R.apply(R.zipObj),
    R.concat([['lon', 'lat']]),
    R.of,
    R.map(parseFloat),
    R.slice(1, 3),
    R.match(/\((.*?)\s(.*?)\)/),
    R.path(['nodes', 0, '_val']),
  ),
);

const fakeLocations = R.times(
  () => mockLocation(LOCATION, true, 'locations'),
  3,
);

const fakeTrucks = R.times(() => mockLocation(TRUCK, true, 'trucks'), 2);

const fakeLoadedTrucks = R.times(() => mockLocation(TRUCK, true, 'ltr'), 2);

const fakeWaypoints = R.times(
  () => mockLocation(WAYPOINT, true, '', undefined, 'waypoints'),
  3,
);

export const before = pipe(
  async api => {
    await up(locations)(fakeLocations)();
    const { body: locs } = await api.listLocations();
    await foldP(
      async (_, truckSeed) => {
        const { body: can } = await api.createCan().send({
          ...mockCan(),
          location: locs[Math.floor(Math.random() * locs.length)],
        });
        const { body: truck } = await api
          .createLocation()
          .send(pointFromTextToObj(truckSeed));
        await api.pickupCan({ canId: can.id }).send(truck);
      },
      null,
      fakeLoadedTrucks,
    );
  },
  up(locations)(fakeTrucks),
  up(locations)(fakeWaypoints),
);

export const after = clear;

const testFindById = async request => {
  const [loc] = await my(locations.select());
  const query = { locationId: loc.id };
  const { body: singleRecord } = await expect(200, request(query));
  assert(!R.is(Array, singleRecord), 'is not Array');
  assert.equal(loc.id, singleRecord.id, 'check id');
  assert.equal(loc.name, singleRecord.name, 'check name');
  assert.equal(loc.type, singleRecord.type, 'check type');
};

const testLocationViewBogusValues = () => {
  const emptyArray = locationView({});
  assert(R.is(Object, emptyArray.location), ' contains location object');
  assert.equal(emptyArray.location.lat, null, 'check lat is null');
  assert.equal(emptyArray.location.lon, null, 'check lon is null');
  assert.equal(emptyArray.location.x, undefined, 'x is undefined');
  assert.equal(emptyArray.location.y, undefined, 'y is undefined');
  const filler = { a: 1, b: '2' };
  const filledArray = locationView(filler);
  assert(R.is(Object, emptyArray.location), ' contains location object');
  assert.equal(filledArray.location.lat, null, 'check lat is null');
  assert.equal(filledArray.location.lon, null, 'check lon is null');
  assert.equal(filledArray.location.x, undefined, 'x is undefined');
  assert.equal(filledArray.location.y, undefined, 'y is undefined');
  assert(
    filledArray.a === filler.a && filledArray.b === filler.b,
    'values carried',
  );
  filler.a = 2;
  assert(filledArray.a !== filler.a, 'Object was properly cloned');

  const locationObjLat = { location: { y: 4 } };
  const locationViewObjLat = locationView(locationObjLat);
  assert(
    locationViewObjLat.location.y === undefined &&
      locationViewObjLat.location.lat === 4 &&
      locationViewObjLat.location.x === undefined &&
      locationViewObjLat.location.lon === null,
    'check values with only lat provided',
  );

  const locationObjLon = { location: { x: 4 } };
  const locationViewObjLon = locationView(locationObjLon);
  assert(
    locationViewObjLon.location.x === undefined &&
      locationViewObjLon.location.lon === 4 &&
      locationViewObjLon.location.y === undefined &&
      locationViewObjLon.location.lat === null,
    'check values with only lon provided',
  );
};

export default {
  'first record by id': testFindById,
  'test location view with bogus values': testLocationViewBogusValues,
};
