import assert from 'assert';
import { addDays } from 'date-fns';
import R from 'ramda';

import { my } from '../../../src/utils/query';
import { foldP } from '../../../src/utils/functions';
import constants from '../../../src/utils/constants';
import cans from '../../../src/tables/cans';
import mockLocation from '../../fixtures/location';
import {
  clear,
  upAPI,
  toCreate,
  isOdd,
  all,
  evens,
  odds,
  point,
  rightBbox,
  wrongBbox,
} from '../../helpers/data';
import { expect } from '../../helpers/request';
import { checkLength, mockDates, checkDates } from '../common';

const {
  location: {
    type: { LOCATION, TRUCK, WAYPOINT },
  },
  can: {
    action: { DROPOFF, TRANSFER },
  },
} = constants;

const wasDeleted = 1;

const nearFeature = addDays(new Date(), 10);

const pickedUpBox = [30.35, 50.31, 30.58, 50.52];

const movedLocationPrefix = 'SRCH-moved-loc';

const mockGens = {
  async search(api, i) {
    const {
      body: { id },
    } = await api.createCan().send({
      name: `SRCH-name-${i}`,
      serial: i === 2 ? `unique-serial` : `SRCH-serial-${i}`,
      location: mockLocation(LOCATION, false, `SRCH-initial-loc-${i}-`),
    });
    const newLocNamePrefix = `${movedLocationPrefix}-${i}-`;
    await api.moveCan({ canId: id }).send({
      ...mockLocation(LOCATION, false, newLocNamePrefix),
      location: point(pickedUpBox),
    });
    if (i === 3) {
      await api.pickupCan({ canId: id }).send({
        ...mockLocation(TRUCK, false, newLocNamePrefix),
        location: null,
      });
    }
    if (i === 4) {
      await api.pickupCan({ canId: id }).send({
        ...mockLocation(WAYPOINT, false, newLocNamePrefix),
        location: null,
      });
    }
  },

  async bounds(api, i) {
    const {
      body: { id },
    } = await api.createCan().send({
      location: {
        ...mockLocation(LOCATION, false),
        location: point(rightBbox),
      },
    });
    if (i === 1) {
      await api.moveCan({ canId: id }).send({
        ...mockLocation(LOCATION, false),
        location: point(wrongBbox),
      });
    }
  },
  modifiedSince: mockDates(cans, 'modifiedDate', nearFeature),

  date: mockDates(cans, 'timestamp'),

  async isRequiredMaintenance(_, i) {
    await my(cans.insert({ requiresMaintenance: isOdd(i) ? 0 : 1 }));
  },

  async isOutOfService(_, i) {
    await my(cans.insert({ outOfService: isOdd(i) ? 1 : 0 }));
  },

  async status(_, i) {
    await my(cans.insert({ action: isOdd(i) ? DROPOFF : TRANSFER }));
  },

  async deleted(api, i) {
    const {
      body: { id },
    } = await api.createCan().send({});
    if (i === wasDeleted) {
      await api.deleteCan({ canId: id });
    }
  },

  async size(_, i) {
    await my(cans.insert({ size: isOdd(i) ? 12 : 20 }));
  },

  async name(_, i) {
    await my(cans.insert({ name: `exactName${Number(isOdd(i))}` }));
  },

  async serial(_, i) {
    await my(cans.insert({ serial: `exactSerial${Number(isOdd(i))}` }));
  },
};

const cansToCreate = toCreate(mockGens);

export const before = upAPI(mockGens, cansToCreate);

export const after = clear;

const checkLocationObject = R.uncurryN(2, prop =>
  R.all(R.propSatisfies(R.all(R.propIs(Object, prop)), 'transactions')),
);

export default {
  async noFilter(request) {
    const { body: listOfCans } = await expect(
      200,
      request().expect('Access-Control-Allow-Headers', /X-Requested-With/),
    );
    assert(R.is(Array, listOfCans));
    assert(R.all(R.propIs(Array, 'transactions'), listOfCans));
    assert(checkLocationObject('location1', listOfCans));
    assert(checkLocationObject('location2', listOfCans));
    assert.equal(listOfCans.length, cansToCreate.length - wasDeleted);
    R.forEach(can => {
      R.forEach(transaction => {
        if (!transaction.id) {
          return;
        }
        assert(transaction.timestamp);
      }, can.transactions);
    }, listOfCans);
  },
  searchByCanName: checkLength({ search: 'SRCH' }, all),
  searchBySerial: checkLength({ search: 'nique' }, 1),
  searchEvenPickedUpCans: checkLength({ bounds: R.join(',', pickedUpBox) }, all),
  searchByCurLocationName: checkLength({ search: 'RCH-mov' }, all),
  searchByPrevLocationName: checkLength({ search: 'SRCH-initial' }, 0),
  testModifiedSince: checkLength({ modifiedSince: nearFeature.valueOf() }, all),

  searchByLocationId: async (request, api) =>
    await foldP(
      (_, { id }) => checkLength({ locationId: id }, 1)(request),
      null,
      R.pipe(
        R.prop('body'),
        R.filter(R.propSatisfies(R.contains(movedLocationPrefix), 'name')),
        R.filter(R.complement(R.propSatisfies(R.contains(3), 'name'))),
      )(await api.listLocations()),
    ),
  'search by locationId with allowNullLocations': async request => {
    const locationId = 2;
    const { body: cansWithLocationId } = await request().query({ locationId });

    const { body: allCans } = await request().query();
    const cansWithNullLocation = allCans.filter(
      can => can.location.id === null || can.location.lat === null || can.location.lon === null,
    );

    const expectCount = cansWithLocationId.length + cansWithNullLocation.length;
    const { body: cans } = await request().query({
      locationId,
      allowNullLocations: 1,
    });
    assert.equal(cans.length, expectCount + 1);
  },
  'search by name with deleted cans': async (request, api) => {
    const { body: can } = await api.createCan().send({
      name: `deleted can`,
      serial: 1234,
      location: mockLocation(LOCATION, false, `SRCH-initial-loc-1-`),
    });

    await api.deleteCan({ canId: can.id }).query();

    const { body: cans } = await request().query({
      name: can.name,
      deleted: 1,
    });

    const deletedCan = cans[0];

    assert.equal(deletedCan.name, can.name);
    assert.equal(deletedCan.serial, can.serial);
    assert.equal(deletedCan.deleted, 1);
  },

  'search by name with hazardous cans': async (request, api) => {
    const { body: can } = await api.createCan().send({
      name: `hazardous can`,
      serial: 123432,
      hazardous: 1,
      location: mockLocation(LOCATION, false, `SRCH-initial-loc-1-`),
    });

    const { body: cans } = await request().query({ hazardous: 1 });

    const deletedCan = cans[0];

    await api.deleteCan({ canId: can.id }).query();
    assert.equal(deletedCan.name, can.name);
    assert.equal(deletedCan.serial, can.serial);
    assert.equal(deletedCan.hazardous, 1);
  },

  'bulk locations': async (request, api) => {
    const { body: can } = await api.createCan().send({
      name: `bulk  1`,
      serial: 1234,
      location: mockLocation(LOCATION, false, `SRCH-initial-loc-1-2`),
    });

    const { body: can2 } = await api.createCan().send({
      name: `bulk 2`,
      serial: 2345,
      location: mockLocation(LOCATION, false, `SRCH-initial-loc-1-3`),
    });

    const { body: cans } = await request().query({
      locationId: `${can.location.id},${can2.location.id}`,
    });
    await api.deleteCan({ canId: can.id }).query();
    await api.deleteCan({ canId: can2.id }).query();
    assert.equal(cans.length, 2);
    assert.equal(cans[0].id, can.id);
    assert.equal(cans[1].id, can2.id);
  },

  'bulk locations with broken locations id list': async (request, api) => {
    const { body: can } = await api.createCan().send({
      name: `bulk  1`,
      serial: 1234,
      location: mockLocation(LOCATION, false, `SRCH-initial-loc-1-2`),
    });

    const { body: can2 } = await api.createCan().send({
      name: `bulk 2`,
      serial: 2345,
      location: mockLocation(LOCATION, false, `SRCH-initial-loc-1-3`),
    });

    const { body: cans } = await request().query({
      locationId: `${can.location.id}, hello, world, ${can2.location.id}`,
    });
    await api.deleteCan({ canId: can.id }).query();
    await api.deleteCan({ canId: can2.id }).query();
    assert.equal(cans.length, 2);
    assert.equal(cans[0].id, can.id);
    assert.equal(cans[1].id, can2.id);
  },

  'locations without transactions': async (request, api) => {
    const { body: can } = await api.createCan().send({
      name: `bulk 3`,
      serial: 1234563,
      location: mockLocation(LOCATION, false, `SRCH-initial-loc-1-`),
    });

    const { body: cans } = await request().query({
      locationId: can.location.id,
      withTransactions: 0,
    });

    await api.deleteCan({ canId: can.id }).query();
    assert.equal(cans[0].transactions, undefined);
  },

  'search by name with deleted cans with flag 0': async (request, api) => {
    const { body: can } = await api.createCan().send({
      name: `deleted can`,
      serial: 1234,
      location: mockLocation(LOCATION, false, `SRCH-initial-loc-1-`),
    });

    await api.deleteCan({ canId: can.id }).query();

    const { body: cans } = await request().query({
      name: can.name,
      deleted: 0,
    });

    assert.equal(cans.length, 0);
  },

  'can should be availible after pickup from null location': async (request, api) => {
    const { body: can } = await api.createCan().send({
      name: `it is null location can`,
      serial: 1234,
      location: {
        id: 9876,
      },
    });

    const bounds = '-2,-2,2,2';

    const truckLocation = mockLocation(TRUCK, false, '1234');

    await api.pickupCan({ canId: can.id }).send({
      ...truckLocation,
      location: {
        ...truckLocation.location,
        lat: 1,
        lon: 1,
      },
    });

    const { body: cans } = await request().query({ search: can.name, bounds });

    await api.deleteCan({ canId: can.id }).query();
    assert(cans.length > 0);
    assert.equal(cans[0].id, can.id);
  },

  'not allow null location': async request => {
    const { body: allCans } = await request().query();
    const expectCount = allCans.filter(can => can.location.id).length;

    const { body: cans } = await request().query({ allowNullLocations: 0 });

    assert.equal(cans.length, expectCount);
  },
  boundsRight: checkLength({ bounds: R.join(',', rightBbox) }, 4),
  boundsWrong: checkLength({ bounds: R.join(',', wrongBbox) }, 1),
  'right bounds with not allow null location': checkLength(
    {
      bounds: R.join(',', rightBbox),
      allowNullLocations: 0,
    },
    4,
  ),
  'cans by right bounds with allow null locations': async request => {
    const { body: allCans } = await request().query();
    const cansWithNullLocation = allCans.filter(
      can => can.location.id === null || can.location.lat === null || can.location.lon === null,
    );
    const cansWithRightBounds = all;
    const expectCountCans = cansWithNullLocation.length + cansWithRightBounds;

    const { body: cans } = await request().query({
      bounds: R.join(',', rightBbox),
      allowNullLocations: 1,
    });
    assert.equal(cans.length, expectCountCans);
  },
  'API-196 cans by right bounds': async (request, api) => {
    const { body: loc1 } = await api.createLocation().send({
      ...mockLocation(LOCATION, false, '1234'),
      location: {
        lon: 134,
        lat: 134,
      },
    });
    const { body: loc2 } = await api.createLocation().send({
      ...mockLocation(TRUCK, false, '1234'),
      location: {
        lon: 134,
        lat: 134,
      },
    });
    const { body: loc3 } = await api.createLocation().send({
      ...mockLocation(TRUCK, false, '1234'),
      location: {
        lon: 136,
        lat: 136,
      },
    });
    const { body: locNull } = await api.createLocation().send({
      ...mockLocation(TRUCK, false, '1234'),
      location: null,
    });
    // Location fits bounds
    const canWithLocation = {
      name: 'canWithLocation',
      serial: 1111,
      locationId: loc1.id,
    };
    // location is null, Type is not TRUCK
    const canWithPrevLocationAndNullLocation = {
      name: 'canWithPrevLocationAndNullLocation',
      serial: 2222,
      locationId: null,
      prevLocationId: loc1.id,
    };
    // prevLocation fits bounds, location is null, Type is TRUCK
    const canWithTruck = {
      name: 'canWithTruck',
      serial: 3333,
      locationId: locNull.id,
      prevLocationId: loc2.id,
    };
    // Location fits bounds, Type is TRUCK
    const canWithTruckAndNullPrevLocation = {
      name: 'canWithTruckAndNullPrevLocation',
      serial: 4444,
      locationId: loc2.id,
    };
    // Location Doesn't fit bounds, Type is TRUCK
    const canWithTruckAndLocation = {
      name: 'canWithTruckAndNullPrevLocation',
      serial: 5555,
      locationId: loc3.id,
      prevLocationId: loc2.id,
    };
    const can1 = await my(cans.insert(canWithLocation));
    const can2 = await my(cans.insert(canWithPrevLocationAndNullLocation));
    const can3 = await my(cans.insert(canWithTruck));
    const can4 = await my(cans.insert(canWithTruckAndNullPrevLocation));
    const can5 = await my(cans.insert(canWithTruckAndLocation));

    const { body: cansNew } = await request().query({
      bounds: '134,134,134,134',
    });
    const cansFiltered = cansNew.filter(
      can => can.id === can1.insertId || can.id === can3.insertId || can.id === can4.insertId,
    );
    assert.equal(cansFiltered.length, 3);
    await api.deleteCan({ canId: can1.insertId }).query();
    await api.deleteCan({ canId: can2.insertId }).query();
    await api.deleteCan({ canId: can3.insertId }).query();
    await api.deleteCan({ canId: can4.insertId }).query();
    await api.deleteCan({ canId: can5.insertId }).query();
  },

  'API-158 seach cans by locName, prevLocName, waypointName': async (request, api) => {
    const { body: loc1 } = await api.createLocation().send({
      ...mockLocation(LOCATION, false, 'firstLocation'),
      location: {
        lon: 128,
        lat: 128,
      },
      waypointName: 'firstWaypointName',
    });
    const { body: loc2 } = await api.createLocation().send({
      ...mockLocation(TRUCK, false, 'secondLocation'),
      location: {
        lon: 128,
        lat: 128,
      },
      waypointName: 'secondWaypointName',
    });
    const { body: loc3 } = await api.createLocation().send({
      ...mockLocation(TRUCK, false, 'thirdLocation'),
      location: {
        lon: 128,
        lat: 128,
      },
      waypointName: 'thirdWaypointName',
    });
    const { body: locNull } = await api.createLocation().send({
      ...mockLocation(TRUCK, false, '1234'),
      location: null,
    });
    const canWithLocation = {
      name: 'canWithLocation',
      serial: 1111,
      locationId: loc1.id,
    };
    const canWithPrevLocationAndNullLocation = {
      name: 'canWithPrevLocationAndNullLocation',
      serial: 2222,
      locationId: null,
      prevLocationId: loc1.id,
    };
    const canWithTruck = {
      name: 'canWithTruck',
      serial: 3333,
      locationId: locNull.id,
      prevLocationId: loc2.id,
    };
    const canWithTruckAndNullPrevLocation = {
      name: 'canWithTruckAndNullPrevLocation',
      serial: 4444,
      locationId: loc2.id,
      prevLocationId: loc1.id,
    };
    const canWithTruckAndLocation = {
      name: 'canWithTruckAndNullPrevLocation',
      serial: 5555,
      locationId: loc3.id,
      prevLocationId: loc2.id,
    };
    const can1 = await my(cans.insert(canWithLocation));
    const can2 = await my(cans.insert(canWithPrevLocationAndNullLocation));
    const can3 = await my(cans.insert(canWithTruck));
    const can4 = await my(cans.insert(canWithTruckAndNullPrevLocation));
    const can5 = await my(cans.insert(canWithTruckAndLocation));

    const checkSearch = async (searchStr, bounds) => {
      const { body: searchResult } = await request().query({
        search: searchStr,
        bounds: bounds,
      });
      return searchResult;
    };
    const cansByLocName = await checkSearch('firstLocat', '128,128,128,128');
    assert.equal(cansByLocName.length, 1);
    assert.equal(cansByLocName[0].id, can1.insertId);

    const cansByWayPointName = await checkSearch('firstWaypoint', '128,128,128,128');
    assert.equal(cansByWayPointName.length, 1);
    assert.equal(cansByWayPointName[0].id, can1.insertId);

    const cansByPrevLocName = await checkSearch('secondLocation', '128,128,128,128');
    assert.equal(cansByPrevLocName.length, 2);

    const cansByPrevWayPointName = await checkSearch('secondWaypoint', '128,128,128,128');
    assert.equal(cansByPrevWayPointName.length, 2);

    const withWrongBounds = await checkSearch('secondWaypoint', '138,138,138,138');
    assert.equal(withWrongBounds.length, 0);

    await api.deleteCan({ canId: can1.insertId }).query();
    await api.deleteCan({ canId: can2.insertId }).query();
    await api.deleteCan({ canId: can3.insertId }).query();
    await api.deleteCan({ canId: can4.insertId }).query();
    await api.deleteCan({ canId: can5.insertId }).query();
  },

  'cans by right bounds with allow null locations with id': async (request, api) => {
    const { body: can } = await api.createCan().send({
      name: `deleted can`,
      serial: 1234,
      location: { id: 19283 },
    });

    const { body: cans } = await request().query({
      bounds: R.join(',', rightBbox),
      allowNullLocations: 1,
    });

    await api.deleteCan({ canId: can.id }).query();
    const canWithLatAndLonNull = R.find(c => c.id === can.id, cans);

    assert.equal(can.id, canWithLatAndLonNull.id);
    assert.equal(can.location.lat, canWithLatAndLonNull.location.lat);
    assert.equal(can.location.lon, canWithLatAndLonNull.location.lon);
  },
  [`all cans with transactions compared to all
  cans with cans without transactions`]: async request => {
    const comparator = R.comparator((x, y) => x.id < y.id);
    let { body: allCansWithTransactions } = await request().query();
    let { body: allCansWithoutTransactions } = await request().query({
      withTransactions: '0',
    });
    allCansWithTransactions = R.sort(comparator, allCansWithTransactions);
    allCansWithoutTransactions = R.sort(comparator, allCansWithoutTransactions);
    assert.notEqual(allCansWithTransactions[0].transactions, undefined);
    assert.equal(allCansWithoutTransactions[0].transactions, undefined);
    assert.equal(allCansWithTransactions.length, allCansWithoutTransactions.length);
    assert.equal(allCansWithTransactions.length > 1, true);
    const allCansWithTransactionsMinusTransactions = R.map(
      R.omit(['transactions']),
      allCansWithTransactions,
    );
    assert.equal(
      JSON.stringify(allCansWithTransactionsMinusTransactions),
      JSON.stringify(allCansWithoutTransactions),
    );
  },
  dateFourDaysAgo: checkDates,
  requiredMaintenance: checkLength({ isRequiredMaintenance: 1 }, evens),
  notRequiredMaintenance: checkLength(
    { isRequiredMaintenance: 0 },
    cansToCreate.length - evens - wasDeleted,
  ),
  outOfService: checkLength({ isOutOfService: 1 }, odds),
  notOutOfService: checkLength({ isOutOfService: 0 }, cansToCreate.length - odds - wasDeleted),
  statusDropOff: checkLength({ status: DROPOFF }, odds),
  statusTransfer: checkLength({ status: TRANSFER }, evens),

  size12: checkLength({ size: 12 }, odds),
  size20: checkLength({ size: 20 }, evens),

  exactName1: checkLength({ name: 'exactName1' }, odds),
  exactName0: checkLength({ name: 'exactName0' }, evens),

  exactSerial1: checkLength({ serial: 'exactSerial1' }, odds),
  exactSerial0: checkLength({ serial: 'exactSerial0' }, evens),
};
