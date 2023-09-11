import assert from 'assert';
import R, { pipeP as pipe, compose as o } from 'ramda';

import locations from '../../../src/tables/locations';
import drivers from '../../../src/tables/drivers';
import constants from '../../../src/utils/constants';
import { my } from '../../../src/utils/query';
import locationView from '../../../src/views/location';

import { expect } from '../../helpers/request';
import mockLocation from '../../fixtures/location';
import { clear, isOdd, toUTC } from '../../helpers/data';

const {
  location: {
    type: { TRUCK },
  },
} = constants;

let listOfDrivers;

export const before = pipe(clear, async () => {
  await my(locations.insert(R.times(() => mockLocation(TRUCK), 2)));
  const listOfTrucks = await my(locations.select().where({ type: TRUCK }));
  const driversToInsert = R.times(
    i => ({
      name: ['first', 'second', 'third', 'fourth', 'fifth'][i],
      truckId: (isOdd(i) ? R.head(listOfTrucks) : R.last(listOfTrucks)).id,
    }),
    5,
  );
  await my(drivers.insert(driversToInsert));
  listOfDrivers = R.map(
    driver =>
      o(
        R.invoker(0, 'valueOf'),
        R.omit(['truckId']),
        R.set(
          R.lensProp('truck'),
          locationView(
            R.find(R.where({ id: R.equals(driver.truckId) }), listOfTrucks),
          ),
        ),
      )(driver),
    await my(drivers.select()),
  );
});

export const after = clear;

const datesToUTC = R.map(toUTC, ['modifiedDate', 'createdDate']);

const clean = R.pipe(
  R.over(
    R.lensProp('truck'),
    o(R.omit(['seedName', 'deleted']), ...datesToUTC),
  ),
  ...datesToUTC,
);

export default {
  async list(request) {
    const { body } = await expect(200, request());
    assert.deepEqual(R.map(clean, listOfDrivers), body);
  },
  async search(request) {
    const { body } = await expect(200, request().query({ search: 'th' }));
    assert.deepEqual(
      o(
        R.map(clean),
        R.filter(R.where({ name: R.contains('th') })),
      )(listOfDrivers),
      body,
    );
  },
  searchDeleted: async (request, api) => {
    const { body: origDrivers } = await request().query();
    const [driver] = origDrivers;

    await api.deleteDriver({ driverId: driver.id }).query();
    const { body: drivers } = await request().query({
      deleted: 1,
    });
    const [deletedDriver] = drivers;

    assert.equal(deletedDriver.id, driver.id);
    assert.equal(deletedDriver.deleted, 1);
  },
  searchDeleted0: async (request, api) => {
    const { body: origDrivers } = await request().query();
    const [driver] = origDrivers;

    await api.deleteDriver({ driverId: driver.id }).query();
    const { body: drivers } = await request().query({
      deleted: 0,
    });

    assert.equal(origDrivers.length - 1, drivers.length);
  },
};
