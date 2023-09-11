import assert from 'assert';
import R from 'ramda';
import drivers from '../../../src/tables/drivers';
import driversTruck from '../../../src/tables/drivers-truck';
import { one } from '../../../src/utils/query';
import driverView from '../../../src/views/driver';
import { expect } from '../../helpers/request';
import { invalid, notFound } from '../common';
import mockDriver from '../../fixtures/driver';
import { up, clear, dates } from '../../helpers/data';

export const before = up(drivers)(R.times(mockDriver, 5));

export const after = clear;

export default {
  async success(request) {
    const driver = dates(driverView(await one(driversTruck.select())));
    const { body } = await expect(
      200,
      request({
        driverId: driver.id,
      }),
    );
    assert.deepEqual(driver, body);
  },
  notFound: notFound(drivers, 'driverId', 'id'),
  invalid: invalid('driverId'),
};
