import cloneDeep from 'lodash/cloneDeep.js';

import ctx from '../../__tests__/mocks/ctx.js';
import repos from '../../__tests__/mocks/batchUpdate/repos/repos.js';
import {
  baseInput,
  baseResult,
  allIds,
} from '../../__tests__/data/batchUpdate/getPricesFilters.js';
import getPricesFilters from './getPricesFilters.js';

jest.mock('../../../../utils/unitsConvertor.js');

describe('getPricesFilters', () => {
  let input = {};
  let result = {};

  beforeEach(() => {
    input = cloneDeep(baseInput);
    result = cloneDeep(baseResult);
  });

  test('empty arrays for all', async () => {
    const output = await getPricesFilters(ctx.state, input, undefined, repos);
    expect(output).toEqual(result);
  });

  test('allIds for for All services', async () => {
    input.servicesFilters.lineItems = { getAll: true, ids: [1, 2, 3] };
    input.servicesFilters.services = { getAll: true, ids: [] };
    input.servicesFilters.equipmentItems = { getAll: true, ids: [] };
    input.servicesFilters.materials = { getAll: true, ids: [1] };

    const output = await getPricesFilters(ctx.state, input, undefined, repos);

    result.lineItemIds = allIds;
    result.servicesIds = allIds;
    result.equipmentItemIds = allIds;
    result.materialIds = allIds;

    expect(output).toEqual(result);
  });

  test('some ids for All', async () => {
    input.servicesFilters.lineItems = { getAll: false, ids: [1] };
    input.servicesFilters.services = { getAll: false, ids: [1, 2] };
    input.servicesFilters.equipmentItems = { getAll: false, ids: [1, 2, 3] };
    input.servicesFilters.materials = { getAll: false, ids: [1, 2, 3, 4] };

    const output = await getPricesFilters(ctx.state, input, undefined, repos);

    result.lineItemIds = [1];
    result.servicesIds = [1, 2];
    result.equipmentItemIds = [1, 2, 3];
    result.materialIds = [1, 2, 3, 4];

    expect(output).toEqual(result);
  });

  test('all services and some for materials, lineItemIds and empty others', async () => {
    input.servicesFilters.lineItems = { getAll: false, ids: [1] };
    input.servicesFilters.services = { getAll: true, ids: [] };
    input.servicesFilters.equipmentItems = { getAll: false, ids: [] };
    input.servicesFilters.materials = { getAll: false, ids: [1, 2] };

    const output = await getPricesFilters(ctx.state, input, undefined, repos);

    result.lineItemIds = [1];
    result.servicesIds = allIds;
    result.equipmentItemIds = [];
    result.materialIds = [1, 2];

    expect(output).toEqual(result);
  });
});
