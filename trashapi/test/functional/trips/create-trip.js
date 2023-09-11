import assert from 'assert';
import R from 'ramda';
import constants from '../../../src/utils/constants';
import { expect, body } from '../../helpers/request';
import { clear, isOdd } from '../../helpers/data';
import locations from '../../../src/tables/locations';
import drivers from '../../../src/tables/drivers';
import { my } from '../../../src/utils/query';
import mockTrip from '../../fixtures/trip';
import mockLocation from '../../fixtures/location';

const {
  location: {
    type: { TRUCK },
  },
} = constants;
const odometer = 0;

export const before = R.pipeP(clear, async () => {
  await my(locations.insert(R.times(() => mockLocation(TRUCK), 1)));
  const listOfTrucks = await my(locations.select().where({ type: TRUCK }));
  const driversToInsert = R.times(
    i => ({
      name: ['first', 'second', 'third', 'fourth', 'fifth'][i],
      truckId: (isOdd(i) ? R.head(listOfTrucks) : R.last(listOfTrucks)).id,
    }),
    1,
  );
  await my(drivers.insert(driversToInsert));
});

async function getTruckAndDriver() {
  const [truck] = await my(locations.select().where({ type: TRUCK }));
  const [driver] = await my(drivers.select());
  return { truck, driver };
}

export const after = clear;

export default {
  'API-180 - create trip': async request => {
    const odometer = 2.5;
    const { truck, driver } = await getTruckAndDriver();
    const mock = mockTrip(
      truck.id,
      driver.id,
      driver.name,
      driver.name,
      odometer,
    );
    const created = await body(expect(201, request().send(mock)));
    assert.equal(mock.tripType, created.tripType);
    assert.equal(mock.odometer, created.odometer);
  },
  '- should not create trip if driver or truck is not exists': async request => {
    const {
      truck: { id: truckId },
      driver: { id: driverId, name },
    } = await getTruckAndDriver();
    const mock = mockTrip(truckId + 1, driverId + 1, name, name);
    await expect(500, request().send(mock));
  },
  'API-180 - should create trip with odometer val 0': async request => {
    const {
      truck: { id: truckId },
      driver: { id: driverId, name },
    } = await getTruckAndDriver();
    const mock = mockTrip(truckId, driverId, name, name, odometer);
    const created = await body(expect(201, request().send(mock)));
    assert.equal(created.odometer, 0);
  },
  'API-180 - should not create trip without odometer': async request => {
    const {
      truck: { id: truckId },
      driver: { id: driverId, name },
    } = await getTruckAndDriver();
    const mock = mockTrip(truckId, driverId, name, name);
    await expect(500, request().send({ ...mock, odometer: null }));
  },
};
