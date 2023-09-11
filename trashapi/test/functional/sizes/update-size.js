import assert from 'assert';
import R from 'ramda';
import { expect } from '../../helpers/request';
import { notFound, invalid, pipeline } from '../common';
import sizes from '../../../src/tables/sizes';
import { my, one } from '../../../src/utils/query';
import { clear, dates } from '../../helpers/data';

export const beforeEach = async api => {
  await api.createSize().send({
    name: '10',
  });
  await api.createSize().send({
    name: '12',
  });
};

export const afterEach = clear;

const clean = R.omit(['modifiedDate', 'modifiedBy']);

export default {
  'API-234 should update size name': async request => {
    const size = {
      ...(await one(sizes.select())),
      name: '20',
    };
    const { body } = await expect(202, request({ id: size.id }).send(size));
    assert.deepEqual(clean(dates(size)), clean(body));
  },

  'API-234 not found on updating size': notFound(sizes, 'id', 'id'),

  'API-234 invalid request on updating size': pipeline(
    invalid('id'),
    async request => {
      const [size] = await my(sizes.select());
      await expect(400, request({ id: size.id }).send([]));
    },
  ),

  [`API-234 should not be able to update size name to existing one`]: async (
    request,
    api,
  ) => {
    const { body: sizes } = await api.listSizes();
    await expect(
      500,
      request({ id: sizes[0].id }).send({
        name: sizes[1].name,
      }),
    );
  },
};
