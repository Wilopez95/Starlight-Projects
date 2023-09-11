import assert from 'assert';
import { expect } from '../../helpers/request';
import { clear } from '../../helpers/data';

export const afterEach = clear;

export default {
  'API-234 create material': async request => {
    const material = {
      name: 'steel',
    };
    const { body } = await expect(201, request().send(material));

    assert(material.name);
    assert.equal(material.name, body.name);
  },

  'API-234 should not be able to create material without a name': async request => {
    const material = {};

    await expect(500, request().send(material));
  },

  'API-234 - should lookup for existing material': async request => {
    const material = {
      name: 'steel',
    };
    const { body: alreadyCreated } = await request().send(material);

    const { body: created } = await expect(201, request().send(material));

    assert.equal(created.id, alreadyCreated.id);
    assert.equal(created.userId, alreadyCreated.userId);
  },

  'API-234 - should recreate material if it was deleted': async (
    request,
    api,
  ) => {
    const material = {
      name: 'iron',
    };
    const { body: alreadyCreated } = await request().send(material);

    await api.deleteMaterial({ id: alreadyCreated.id });
    const { body: deletedmaterial } = await api
      .listMaterials()
      .query({ deleted: '1' });
    assert.equal(deletedmaterial[0].deleted, 1);
    assert.equal(deletedmaterial[0].id, alreadyCreated.id);

    const { body: created } = await expect(201, request().send(material));

    assert.equal(created.name, alreadyCreated.name);
    assert.equal(created.deleted, 0);
  },

  'API-234 - should omit id param on create': async request => {
    const material1 = {
      name: 'iron',
    };
    const material2 = {
      id: 404,
      name: 'wood',
    };
    const { body: created1 } = await request().send(material1);
    const { body: created2 } = await request().send(material2);

    assert.equal(created2.id, created1.id + 1);
  },

  'API-234 - should omit deleted param on create': async request => {
    const material = {
      name: 'copper',
      deleted: '1',
    };
    const { body: created } = await request().send(material);

    assert.notEqual(created.deleted, 1);
  },
  'API-234 invalid request on creating material': async request => {
    await expect(400, request().send([]));
  },

  'API-234 empty payload on creating material': async request => {
    await expect(500, request().send({}));
  },
};
