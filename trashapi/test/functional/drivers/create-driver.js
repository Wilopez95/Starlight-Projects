import assert from 'assert';
import constants from '../../../src/utils/constants';
import { my } from '../../../src/utils/query';
import locations from '../../../src/tables/locations';
import { expect } from '../../helpers/request';
import { clear } from '../../helpers/data';
import mockLocation from '../../fixtures/location';
import mockDriver from '../../fixtures/driver';

const {
  location: {
    type: { LOCATION, TRUCK },
  },
} = constants;

export const beforeEach = clear;

export const afterEach = clear;

export default {
  async withTruck(request) {
    const driver = {
      ...mockDriver(),
      truck: mockLocation(TRUCK, false),
    };
    const { body } = await expect(201, request().send(driver));
    assert.equal(driver.name, body.name);
    assert.equal(driver.truck.name, body.truck.name);
    assert.equal(driver.truck.type, body.truck.type);
  },
  async omitId(request) {
    const driver = {
      ...mockDriver(),
      truck: mockLocation(TRUCK, false),
      id: 555,
    };
    const { body } = await expect(201, request().send(driver));
    assert.equal(driver.name, body.name);
    assert.equal(driver.truck.name, body.truck.name);
    assert.equal(body.id !== 555, true);
  },
  async noTruck(request) {
    const driver = mockDriver();
    const { body } = await expect(201, request().send(driver));
    assert.equal(driver.name, body.name);
    assert.equal(body.truck.name, null);
    assert.equal(body.truck.type, null);
    const trucks = await my(locations.select().where({ type: TRUCK }));
    assert.equal(trucks.length, 0);
  },
  async noType(request) {
    const { body: driver } = await expect(
      201,
      request().send({
        ...mockDriver(),
        truck: { name: 'should be truck' },
      }),
    );
    assert.equal(driver.truck.type, TRUCK);
  },
  async withLocation(request) {
    await expect(
      400,
      request().send({
        ...mockDriver(),
        truck: mockLocation(LOCATION, false),
      }),
    );
  },
  async ivnalid(request) {
    await expect(400, request().send([]));
  },
};
