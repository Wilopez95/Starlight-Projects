import assert from 'assert';
import { expect } from '../../helpers/request';
import { clear } from '../../helpers/data';

export const afterEach = clear;

export default {
  'API-234 create size': async request => {
    const size = {
      name: '10',
    };
    const { body } = await expect(201, request().send(size));

    assert(size.name);
    assert.equal(size.name, body.name);
  },

  'API-234 should not be able to create size without a name': async request => {
    const size = {};

    await expect(500, request().send(size));
  },

  'API-234 - should lookup for existing size': async request => {
    const size = {
      name: '10',
    };
    const { body: alreadyCreated } = await request().send(size);

    const { body: created } = await expect(201, request().send(size));

    assert.equal(created.id, alreadyCreated.id);
    assert.equal(created.userId, alreadyCreated.userId);
  },

  'API-234 - should recreate size if it was deleted': async (request, api) => {
    const size = {
      name: '20',
    };
    const { body: alreadyCreated } = await request().send(size);

    await api.deleteSize({ id: alreadyCreated.id });
    const { body: deletedSize } = await api.listSizes().query({ deleted: '1' });
    assert.equal(deletedSize[0].deleted, 1);
    assert.equal(deletedSize[0].id, alreadyCreated.id);

    const { body: created } = await expect(201, request().send(size));

    assert.equal(created.name, alreadyCreated.name);
    assert.equal(created.deleted, 0);
  },

  'API-234 - should omit id param on create': async request => {
    const size1 = {
      name: '20',
    };
    const size2 = {
      id: 404,
      name: '30',
    };
    const { body: created1 } = await request().send(size1);
    const { body: created2 } = await request().send(size2);

    assert.equal(created2.id, created1.id + 1);
  },

  'API-234 - should omit deleted param on create': async request => {
    const size = {
      name: '40',
      deleted: '1',
    };
    const { body: created } = await request().send(size);

    assert.notEqual(created.deleted, 1);
  },
  'API-234 invalid request on creating size': async request => {
    await expect(400, request().send([]));
  },

  'API-234 empty payload on creating size': async request => {
    await expect(500, request().send({}));
  },
};
