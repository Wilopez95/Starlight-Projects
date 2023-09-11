import assert from 'assert';
import R from 'ramda';
import { expect } from '../../helpers/request';
import { clear } from '../../helpers/data';
import constants from '../../../src/utils/constants';

const {
  can: { size: sizes },
} = constants;
const SIZES_AMOUNT = sizes.length;

export const beforeEach = clear;

export const afterEach = clear;

export default {
  'API-235 should create default sizes': async request => {
    const { body } = await expect(202, request());
    assert.equal(body.length, SIZES_AMOUNT);
    R.times(i => {
      assert.equal(body[i].name, sizes[i]);
    }, body.length);
  },

  'API-235 should not create default sizes if they already exist': async (
    request,
    api,
  ) => {
    const { body } = await expect(202, request());
    assert.equal(body.length, SIZES_AMOUNT);

    await expect(202, request());

    const { body: sizesList } = await api.listSizes();
    assert.equal(sizesList.length, SIZES_AMOUNT);
    R.times(i => {
      assert.equal(sizesList[i].name, sizes[i]);
    }, sizesList.length);
  },
};
