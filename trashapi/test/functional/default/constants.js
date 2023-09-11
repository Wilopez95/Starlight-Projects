import assert from 'assert';
import R from 'ramda';
import { expect } from '../../helpers/request';
import { clear, compareArrays } from '../../helpers/data';

export const beforeEach = async api => {
  await api.createDefaultMaterials();
  await api.createDefaultSizes();
};
export const afterEach = clear;

const sortComparator = R.comparator(
  (a, b) => a.length < b.length || (a.length === b.length && a.name < b.name),
);

export default {
  async success(request) {
    const { body: constants } = await expect(200, request());
    assert(constants.driverApp);
    assert(constants.can);
    assert(constants.can.action);
    assert(constants.can.action.MOVE);
    assert(constants.location);
    assert(constants.location.type);
    assert(constants.location.type.LOCATION);
    assert(constants.workOrder);
    assert(constants.workOrder.action);
    assert(constants.workOrder.action.SPOT);
    assert(constants.workOrder.status);
    assert(constants.workOrder.status.UNASSIGNED);
    assert(constants.actionTransitionsRelation);
  },

  async actionTransitionsOrdered(request) {
    const {
      body: { actionTransitionsOrdered },
    } = await expect(200, request());

    Object.keys(actionTransitionsOrdered).forEach(action =>
      actionTransitionsOrdered[action].forEach(step =>
        assert.ok(
          step,
          action +
            ' ' +
            JSON.stringify(actionTransitionsOrdered[action], null, 2),
        ),
      ),
    );
  },

  'API-234 should get constants with custom material': async (request, api) => {
    const newMaterial = 'Zips';
    const { body: constants } = await expect(200, request());
    const materials = R.clone(constants.workOrder.material);

    materials.push(newMaterial);
    await api.createMaterial().send({ name: newMaterial });
    const {
      body: {
        workOrder: { material },
      },
    } = await expect(200, request());

    assert.equal(material.length, 11);
    assert(compareArrays(materials, material));
  },

  'API-234 should get constants with custom size': async (request, api) => {
    const newSize = '42CT';
    const { body: constants } = await expect(200, request());
    const sizes = R.clone(constants.can.size);

    sizes.push(newSize);
    await api.createSize().send({ name: newSize });
    const {
      body: {
        can: { size },
      },
    } = await expect(200, request());

    assert.equal(size.length, 7);
    assert(compareArrays(sizes, size));
  },

  'API-235 should materials be sorted on response': async (request, api) => {
    const newMaterials = ['Zips', 'Chocolate', 'Old Drivers'];
    const { body: constants } = await expect(200, request());
    const materials = R.clone(constants.workOrder.material);

    for (let i = 0; i < newMaterials.length; i++) {
      await api.createMaterial().send({ name: newMaterials[i] });
      materials.push(newMaterials[i]);
    }
    const {
      body: {
        workOrder: { material },
      },
    } = await expect(200, request());

    assert.equal(material.length, 13);
    assert(!compareArrays(materials, material));
    assert(compareArrays(materials.sort(), material));
  },

  'API-235 should sizes be sorted on response': async (request, api) => {
    const newSizes = ['13', '27'];
    const { body: constants } = await expect(200, request());
    const sizes = R.clone(constants.can.size);

    for (let i = 0; i < newSizes.length; i++) {
      await api.createSize().send({ name: newSizes[i] });
      sizes.push(newSizes[i]);
    }
    const {
      body: {
        can: { size },
      },
    } = await expect(200, request());

    assert.equal(size.length, 8);
    assert(!compareArrays(sizes, size));
    assert(compareArrays(sizes.sort(), size));
  },

  'API-235 should have sort numeric parts as numbers': async (request, api) => {
    const newSizes = ['5', '6c'];
    const { body: constants } = await expect(200, request());
    const sizes = R.clone(constants.can.size);

    for (let i = 0; i < newSizes.length; i++) {
      await api.createSize().send({ name: newSizes[i] });
      sizes.push(newSizes[i]);
    }

    const {
      body: {
        can: { size },
      },
    } = await expect(200, request());

    assert.equal(size.length, 8);
    assert(!compareArrays(sizes, size));
    assert(compareArrays(sizes.sort(sortComparator), size));
  },
};
