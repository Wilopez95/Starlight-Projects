import assert from 'assert';
import R from 'ramda';
import { expect } from '../../helpers/request';
import { notFound, invalid, pipeline } from '../common';
import drivers from '../../../src/tables/drivers';
import locations from '../../../src/tables/locations';
import { my, one } from '../../../src/utils/query';
import { clear, dates } from '../../helpers/data';

export const before = async api => {
  await api.createDriver().send({
    name: 'Sam',
    truck: {
      name: 'Bumblebee',
    },
  });
};

export const after = clear;

const clean = R.omit(['modifiedDate', 'modifiedBy', 'truck', 'truckId']);

export default {
  async success(request) {
    const driver = {
      ...(await one(drivers.select())),
      name: 'Mikaela',
    };
    const { body } = await expect(
      202,
      request({ driverId: driver.id }).send(driver),
    );
    assert.deepEqual(clean(dates(driver)), clean(body));
  },
  async newTruck(request) {
    const driver = await one(drivers.select());
    const { body } = await expect(
      202,
      request({ driverId: driver.id }).send({
        truck: { name: 'Optimus Prime' },
      }),
    );
    assert.equal(body.truck.name, 'Optimus Prime');
    const trucks = await my(locations.select());
    assert.equal(trucks.length, 2);
  },
  notFound: notFound(drivers, 'driverId', 'id'),
  invalid: pipeline(invalid('driverId'), async request => {
    const [driver] = await my(drivers.select());
    await expect(400, request({ driverId: driver.id }).send([]));
  }),
};
