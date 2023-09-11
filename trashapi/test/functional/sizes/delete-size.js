import assert from 'assert';
import { invalid } from '../common';
import sizes from '../../../src/tables/sizes';
import { my } from '../../../src/utils/query';
import { up, clear } from '../../helpers/data';

export const beforeEach = async () => {
  await up(sizes)({ name: '30' })();
};

export const afterEach = clear;

export default {
  'API-234 delete size': async (request, api) => {
    const response = await api.listSizes();
    const size = response.body[0];
    await request({ id: size.id }).expect(204);
    const [deletedSize] = await my(sizes.select().where({ id: size.id }));
    assert(deletedSize.deleted === 1);
  },

  [`API-234 not found on delete size`]: async request => {
    await request({ id: '685685' }).expect(204);
  },

  'API-234 invalid request on delete size': invalid('id'),
};
