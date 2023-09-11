import cloneDeep from 'lodash/cloneDeep.js';
import {
  INCLUDE_NONE_MATERIAL,
  INCLUDE_ALL,
  BATCH_UPDATE_TARGET,
} from '../../../../consts/batchRates.js';
import { PRICE_ENTITY_TYPE } from '../../../../consts/priceEntityTypes.js';
import { baseInput, baseResult } from '../../__tests__/data/batchUpdate/getServiceFilters.js';
import getServicesFilters from './getServicesFilters.js';

describe('getServicesFilters', () => {
  let input = {};
  let result = {};

  beforeEach(() => {
    input = cloneDeep(baseInput);
    result = cloneDeep(baseResult);
  });

  test('targetAll', () => {
    input.target = BATCH_UPDATE_TARGET.all;
    input.materials = [INCLUDE_ALL];
    input.lineItems = [INCLUDE_ALL];
    input.services = [INCLUDE_ALL];
    input.equipmentItems = [INCLUDE_ALL];

    const output = getServicesFilters(input);
    result.servicesFilters.lineItems = {
      getAll: true,
      ids: [],
    };
    result.servicesFilters.services = {
      getAll: true,
      ids: [],
    };
    result.servicesFilters.materials = {
      getAll: true,
      ids: [],
    };
    result.servicesFilters.equipmentItems = {
      getAll: true,
      ids: [],
    };

    expect(output).toEqual(result);
  });

  test('includeNonMaterial true, with material ids', () => {
    input.target = BATCH_UPDATE_TARGET.all;
    input.materials = [1, 2, 3, INCLUDE_NONE_MATERIAL];
    input.lineItems = [INCLUDE_ALL];
    input.services = [INCLUDE_ALL];
    input.equipmentItems = [INCLUDE_ALL];

    const output = getServicesFilters(input);

    result.servicesFilters.lineItems = {
      getAll: true,
      ids: [],
    };
    result.servicesFilters.services = {
      getAll: true,
      ids: [],
    };
    result.servicesFilters.materials = {
      getAll: true,
      ids: [],
    };
    result.servicesFilters.equipmentItems = {
      getAll: true,
      ids: [],
    };

    result.servicesFilters.materials = {
      getAll: false,
      ids: [1, 2, 3],
    };
    result.includeNonMaterial = true;

    expect(output).toEqual(result);
  });

  test('lineItems get all, services ids', () => {
    input.target = BATCH_UPDATE_TARGET.lineItems;
    input.lineItems = [INCLUDE_ALL];

    const output = getServicesFilters(input);

    result.servicesFilters.lineItems = {
      getAll: true,
      ids: [],
    };

    result.entityType = PRICE_ENTITY_TYPE.oneTimeLineItem;

    expect(output).toEqual(result);
  });

  test('recurringLineItems all', () => {
    input.target = BATCH_UPDATE_TARGET.recurringLineItems;
    input.lineItems = [144, 21, 32];

    const output = getServicesFilters(input);

    result.servicesFilters.lineItems = {
      getAll: false,
      ids: [144, 21, 32],
    };

    result.entityType = PRICE_ENTITY_TYPE.recurringLineItem;

    expect(output).toEqual(result);
  });

  test('services, includeNonMaterial true,  material all', () => {
    input.target = BATCH_UPDATE_TARGET.services;
    input.materials = [INCLUDE_ALL, 1, 2, 3, INCLUDE_NONE_MATERIAL];
    input.equipmentItems = [INCLUDE_ALL];
    input.services = [INCLUDE_ALL];

    const output = getServicesFilters(input);

    result.servicesFilters.services = {
      getAll: true,
      ids: [],
    };

    result.servicesFilters.materials = {
      getAll: true,
      ids: [],
    };

    result.servicesFilters.equipmentItems = {
      getAll: true,
      ids: [],
    };
    result.includeNonMaterial = true;
    result.entityType = PRICE_ENTITY_TYPE.oneTimeService;

    expect(output).toEqual(result);
  });

  test('services specific all equipmentItems', () => {
    input.target = BATCH_UPDATE_TARGET.services;
    input.services = [123, 23, 15];
    input.equipmentItems = [INCLUDE_ALL];

    const output = getServicesFilters(input);

    result.servicesFilters.services = {
      getAll: false,
      ids: [123, 23, 15],
    };

    result.servicesFilters.equipmentItems = {
      getAll: true,
      ids: [],
    };

    result.entityType = PRICE_ENTITY_TYPE.oneTimeService;

    expect(output).toEqual(result);
  });

  test('recurringServices all', () => {
    input.target = BATCH_UPDATE_TARGET.recurringServices;
    input.services = [INCLUDE_ALL];
    input.equipmentItems = [12, 45, 43];

    const output = getServicesFilters(input);

    result.servicesFilters.services = {
      getAll: true,
      ids: [],
    };

    result.servicesFilters.equipmentItems = {
      getAll: false,
      ids: [12, 45, 43],
    };

    result.entityType = PRICE_ENTITY_TYPE.recurringService;

    expect(output).toEqual(result);
  });
});
