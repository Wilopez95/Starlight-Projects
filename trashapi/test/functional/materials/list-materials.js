import assert from 'assert';
import R from 'ramda';
import { expect } from '../../helpers/request';
import constants from '../../../src/utils/constants';
import { clear, compareArrays } from '../../helpers/data';

const {
  workOrder: { material: materials },
} = constants;

let allMaterials = [];

const tenant1materials = [materials[0], materials[2]];

const tenant2materials = [materials[1], materials[2], materials[3]];

const sortByName = (a, b) => a.name > b.name;

const createTenantWithMaterials = async (api, materials) => {
  for (let j = 0; j < materials.length; j++) {
    const payload = {
      name: materials[j],
    };
    const { body: material } = await api.createMaterial().send(payload);
    allMaterials.push(material);
  }
};

export const beforeEach = async api => {
  allMaterials = R.empty(allMaterials);

  await createTenantWithMaterials(api, tenant1materials);
  await createTenantWithMaterials(api, tenant2materials);
  allMaterials = R.uniq(allMaterials);
};

export const afterEach = clear;

export default {
  'API-234 list all materials': async request => {
    const { body } = await expect(200, request());

    assert.equal(body.length, 4);
    assert(compareArrays(allMaterials, body));
  },

  'API-234 filter list of the materials by name': async request => {
    const filterByName = async (searchFor, expectQuantity) => {
      const filtered = R.filter(
        material => R.contains(material.name, searchFor),
        allMaterials,
      );
      const { body } = await expect(200, request()).query({
        name: `${searchFor.join(',')}`,
      });
      assert.equal(body.length, expectQuantity);
      assert(compareArrays(filtered, body));
    };

    await filterByName([materials[0]], 1);
    await filterByName([materials[0], materials[1]], 2);
    await filterByName(
      [materials[0], materials[1], materials[2], 'invalid'],
      3,
    );
  },

  'API-234 filter list of the materials by id': async request => {
    const filterById = async (searchFor, expectQuantity) => {
      const filtered = R.filter(
        material => R.contains(material.id, searchFor),
        allMaterials,
      );
      const { body } = await expect(200, request()).query({
        id: `${searchFor.join(',')}`,
      });

      assert.equal(body.length, expectQuantity);
      assert(compareArrays(filtered, body));
    };
    const { body: currentMaterials } = await expect(200, request());

    await filterById([currentMaterials[0].id], 1);
    await filterById(
      [currentMaterials[1].id, currentMaterials[2].id, currentMaterials[3].id],
      3,
    );
    await filterById(
      [currentMaterials[0].id, 'invalid', currentMaterials[1].id],
      2,
    );
  },

  'API-234 filter list of materials by deleted flag': async (request, api) => {
    let response = await expect(200, request());
    let materials = response.body;
    assert.equal(materials.length, allMaterials.length);

    await api.deleteMaterial({ id: materials[0].id }).query();
    response = await request().query({
      deleted: 1,
    });
    materials = response.body;

    assert.equal(materials.length, 4);
    assert.equal(materials.length, allMaterials.length);
    R.times(i => {
      assert(materials[i].name);
      assert.equal(materials[i].name, allMaterials[i].name);
    }, materials.length);

    const filtered = R.filter(
      material => material.id !== allMaterials[0].id,
      allMaterials,
    );
    response = await request().query({
      deleted: 0,
    });
    materials = response.body;

    assert.equal(materials.length, 3);
    assert(compareArrays(materials, filtered));
  },

  'API-235 should sort by name': async request => {
    const { body } = await expect(200, request().query({ sort: 'name' }));

    assert.equal(body.length, 4);
    assert(!compareArrays(allMaterials, body));
    assert(compareArrays(allMaterials.sort(sortByName), body));
  },

  'API-235 should sort by id by default': async request => {
    const { body } = await expect(200, request().query({ sort: 'arbitrary' }));

    assert.equal(body.length, 4);
    assert(compareArrays(allMaterials, body));
    for (let i = 0; i < body.length - 1; i++) {
      assert(body[i].id < body[i + 1].id);
    }
  },
};
