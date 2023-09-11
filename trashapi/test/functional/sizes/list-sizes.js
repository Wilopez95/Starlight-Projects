import assert from 'assert';
import R from 'ramda';
import { expect } from '../../helpers/request';
import constants from '../../../src/utils/constants';
import { clear, compareArrays } from '../../helpers/data';

const {
  can: { size: sizes },
} = constants;

let allSizes = [];

const tenant1Sizes = [sizes[0], sizes[2]];

const tenant2Sizes = [sizes[1], sizes[2], sizes[3]];

const sortByName = (a, b) => a.name > b.name;

const createTenantWithSizes = async (api, sizes) => {
  for (let j = 0; j < sizes.length; j++) {
    const payload = {
      name: sizes[j],
    };
    const { body: size } = await api.createSize().send(payload);
    allSizes.push(size);
  }
};

export const beforeEach = async api => {
  allSizes = R.empty(allSizes);

  await createTenantWithSizes(api, tenant1Sizes);
  await createTenantWithSizes(api, tenant2Sizes);
  allSizes = R.uniq(allSizes);
};

export const afterEach = clear;

export default {
  'API-234 list all sizes': async request => {
    const { body } = await expect(200, request());

    assert.equal(body.length, 4);
    assert(compareArrays(allSizes, body));
  },

  'API-234 filter list of the sizes by name': async request => {
    const filterByName = async (searchFor, expectQuantity) => {
      const filtered = R.filter(
        size => R.contains(size.name, searchFor),
        allSizes,
      );
      const { body } = await expect(200, request()).query({
        name: `${searchFor.join(',')}`,
      });

      assert.equal(body.length, expectQuantity);
      assert(compareArrays(filtered, body));
    };

    await filterByName([sizes[0]], 1);
    await filterByName([sizes[0], sizes[1]], 2);
    await filterByName([sizes[0], sizes[1], sizes[2], 'invalid'], 3);
  },

  'API-234 filter list of the sizes by id': async request => {
    const filterById = async (searchFor, expectQuantity) => {
      const filtered = R.filter(
        size => R.contains(size.id, searchFor),
        allSizes,
      );
      const { body } = await expect(200, request()).query({
        id: `${searchFor.join(',')}`,
      });

      assert.equal(body.length, expectQuantity);
      assert(compareArrays(filtered, body));
    };
    const { body: currentSizes } = await expect(200, request());

    await filterById([currentSizes[0].id], 1);
    await filterById(
      [currentSizes[1].id, currentSizes[2].id, currentSizes[3].id],
      3,
    );
    await filterById([currentSizes[0].id, 'invalid', currentSizes[1].id], 2);
  },

  'API-234 filter list of sizes by deleted flag': async (request, api) => {
    let response = await expect(200, request());
    let sizes = response.body;
    assert.equal(sizes.length, allSizes.length);

    await api.deleteSize({ id: sizes[0].id }).query();
    response = await request().query({
      deleted: 1,
    });
    sizes = response.body;

    assert.equal(sizes.length, 4);
    assert.equal(sizes.length, allSizes.length);
    R.times(i => {
      assert(sizes[i].name);
      assert.equal(sizes[i].name, allSizes[i].name);
    }, sizes.length);

    const filtered = R.filter(size => size.id !== allSizes[0].id, allSizes);
    response = await request().query({
      deleted: 0,
    });
    sizes = response.body;

    assert.equal(sizes.length, 3);
    assert(compareArrays(sizes, filtered));
  },

  'API-235 should sort by name': async request => {
    const { body } = await expect(200, request().query({ sort: 'name' }));

    assert.equal(body.length, 4);
    assert(!compareArrays(allSizes, body));
    assert(compareArrays(allSizes.sort(sortByName), body));
  },

  'API-235 should sort by id by default': async request => {
    const { body } = await expect(200, request().query({ sort: 'arbitrary' }));

    assert.equal(body.length, 4);
    assert(compareArrays(allSizes, body));
    for (let i = 0; i < body.length - 1; i++) {
      assert(body[i].id < body[i + 1].id);
    }
  },
};
