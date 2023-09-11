import assert from 'assert';
import R from 'ramda';
import { expect } from '../../helpers/request';
import { notFound, invalid, pipeline } from '../common';
import materials from '../../../src/tables/materials';
import { my, one } from '../../../src/utils/query';
import { clear, dates } from '../../helpers/data';

export const beforeEach = async api => {
  await api.createMaterial().send({
    name: 'steel',
  });
  await api.createMaterial().send({
    name: 'iron',
  });
};

export const afterEach = clear;

const clean = R.omit(['modifiedDate', 'modifiedBy']);

export default {
  'API-234 should update material name': async request => {
    const material = {
      ...(await one(materials.select())),
      name: 'wood',
    };
    const { body } = await expect(
      202,
      request({ id: material.id }).send(material),
    );
    assert.deepEqual(clean(dates(material)), clean(body));
  },

  'API-234 not found on updating material': notFound(materials, 'id', 'id'),

  'API-234 invalid request on updating material': pipeline(
    invalid('id'),
    async request => {
      const [material] = await my(materials.select());
      await expect(400, request({ id: material.id }).send([]));
    },
  ),

  [`API-234 should not be able to update material name to existing one`]: async (
    request,
    api,
  ) => {
    const { body: materials } = await api.listMaterials();
    await expect(
      500,
      request({ id: materials[0].id }).send({
        name: materials[1].name,
      }),
    );
  },
};
