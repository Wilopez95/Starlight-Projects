import assert from 'assert';

import drivers from '../../../src/tables/drivers';
import { my } from '../../../src/utils/query';

import { invalid } from '../common';
import mockDriver from '../../fixtures/driver';
import { up, clear } from '../../helpers/data';

export const before = up(drivers)(mockDriver());

export const after = clear;

export default {
  async success(request) {
    let [driver] = await my(drivers.select());
    await request({ driverId: driver.id }).expect(204);
    [driver] = await my(drivers.select().where({ id: driver.id }));
    assert(driver.deleted === 1);
  },
  notFound: async request => {
    await request({ driverId: '456748' }).expect(204);
  },
  invalid: invalid('driverId'),
};
