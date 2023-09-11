import assert from 'assert';
import R from 'ramda';
import { expect } from '../../helpers/request';
import { clear } from '../../helpers/data';
import constants from '../../../src/utils/constants';

const {
  workOrder: { material: materials },
} = constants;
const MATERIALS_AMOUNT = materials.length;

export const beforeEach = clear;

export const afterEach = clear;

export default {
  'API-235 should create default materials': async request => {
    const { body } = await expect(202, request());
    assert.equal(body.length, MATERIALS_AMOUNT);
    R.times(i => {
      assert.equal(body[i].name, materials[i]);
    }, body.length);
  },

  'API-235 should not create default materials if they already exist': async (
    request,
    api,
  ) => {
    const { body } = await expect(202, request());
    assert.equal(body.length, MATERIALS_AMOUNT);

    await expect(202, request());

    const { body: materialsList } = await api.listMaterials();
    assert.equal(materialsList.length, MATERIALS_AMOUNT);
    R.times(i => {
      assert.equal(materialsList[i].name, materials[i]);
    }, materialsList.length);
  },
};
