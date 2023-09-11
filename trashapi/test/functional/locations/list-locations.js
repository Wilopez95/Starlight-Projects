/* eslint new-cap: 0 */
import assert from 'assert';
import turf from 'turf';
import R, { pipeP as pipe, compose as o } from 'ramda';
import { C } from 'sanctuary';

import { body, expect } from '../../helpers/request';
import mockCan from '../../fixtures/can';
import mockLocation from '../../fixtures/location';
import { up, clear, rightBbox, wrongBbox } from '../../helpers/data';
import locations, { objectFields } from '../../../src/tables/locations';
import constants from '../../../src/utils/constants';
import { foldP } from '../../../src/utils/functions';

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
const fakeData = R.unnest([
  fakeLocations,
  fakeLoadedTrucks,
  fakeTrucks,
  fakeWaypoints,
]);

export const beforeEach = pipe(
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
  up(locations)({
    name: 'deleted one geolocationproof',
    deleted: 1,
  }),
  up(locations)(fakeTrucks),
  up(locations)(fakeWaypoints),
);

export const afterEach = clear;

const clean = R.omit([
  'id',
  'createdBy',
  'modifiedBy',
  'createdDate',
  'modifiedDate',
]);

const testFind = (query, subset) => async request => {
  const { body: listOfLocations } = await expect(200, request()).query(query);
  assert(R.is(Array, listOfLocations));
  assert.equal(listOfLocations.length, subset.length);
  assert.deepEqual(
    R.map(pointFromTextToObj, subset),
    R.map(clean, listOfLocations),
  );
};

const testGeocoding = (query, bbox) => async request => {
  const { body: listOfLocations } = await expect(200, request().query(query));
  assert(listOfLocations.length >= 1);
  C(R.forEach, listOfLocations, ({ id, location: { lat, lon } }) => {
    assert(!id);
    assert(turf.inside(turf.point([lon, lat]), turf.bboxPolygon(bbox)));
  });
};

export default {
  'find all': testFind(null, fakeData),
  'find by type locations': testFind({ type: LOCATION }, fakeLocations),
  'find by type trucks': testFind(
    { type: TRUCK },
    R.concat(fakeLoadedTrucks, fakeTrucks),
  ),
  'find by deleted locations': async (request, api) => {
    const { body: location } = await api.createLocation().send({
      name: 'deleted location 10293',
    });

    await api.deleteLocation({ locationId: location.id }).query();

    const {
      body: [deletedLocation],
    } = await request().query({
      name: location.name,
      deleted: 1,
    });

    assert.equal(deletedLocation.id, location.id);
    assert.equal(deletedLocation.name, location.name);
    assert.equal(deletedLocation.deleted, 1);
  },
  'find by deleted location with flag 0': async (request, api) => {
    const { body: location } = await api.createLocation().send({
      name: 'deleted location geolocationproof2',
    });

    await api.deleteLocation({ locationId: location.id }).query();

    const { body: deletedLocations } = await request().query({
      name: location.name,
      deleted: 0,
    });

    assert.equal(deletedLocations.length, 0);
  },

  'find by type waypoint': testFind({ type: WAYPOINT }, fakeWaypoints),
  'find by complex type': testFind(
    { type: `${LOCATION},${WAYPOINT}` },
    R.concat(fakeLocations, fakeWaypoints),
  ),
  'find by name locations': testFind({ name: 'ocation' }, fakeLocations),
  'find by name trucks': testFind({ name: 'ruck' }, fakeTrucks),
  'find by waypoint name': testFind({ name: 'aypoin' }, fakeWaypoints),

  'find all trucks available for pickup': testFind(
    {
      type: TRUCK,
      empty: true,
    },
    fakeTrucks,
  ),

  'do not find deleted entries': testFind(
    { name: 'deleted one geolocationproof' },
    [],
  ),

  'no geocoding for trucks': testFind(
    {
      type: 'TRUCK',
      name: 'South Delaware Street',
    },
    [],
  ),

  'geocoding without bounds query param': testGeocoding(
    {
      name: 'ul. Lenina, 23, Omsk',
    },
    wrongBbox,
  ),

  'geocoding with bounds query param': testGeocoding(
    {
      name: '2458 Humboldt St',
      bounds: R.join(',', rightBbox),
    },
    rightBbox,
  ),

  'geocoding with complex type': async request => {
    const locs = await body(
      expect(
        200,
        request().query({
          type: `${LOCATION},${WAYPOINT}`,
          name: 'ul. Lenina, 23, Omsk',
        }),
      ),
    );
    R.forEach(location => {
      assert(R.all(R.contains(R.__, objectFields), R.keys(location)));
      assert(R.contains(location.type, R.values(type)));
    }, locs);
  },
};
