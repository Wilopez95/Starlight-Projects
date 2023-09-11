import assert from 'assert';
import { invalid } from '../common';
import materials from '../../../src/tables/materials';
import { my } from '../../../src/utils/query';
import { up, clear } from '../../helpers/data';

export const beforeEach = async () => {
  await up(materials)({ name: 'steel' })();
};

export const afterEach = clear;

export default {
  'API-234 delete material': async (request, api) => {
    const response = await api.listMaterials();
    const material = response.body[0];
    await request({ id: material.id }).expect(204);
    const [deletedMaterial] = await my(
      materials.select().where({ id: material.id }),
    );
    assert(deletedMaterial.deleted === 1);
  },

  [`API-234 not found on delete material`]: async request => {
    await request({ id: '685685' }).expect(204);
  },

  'API-234 invalid request on delete material': invalid('id'),
};
