import pick from 'lodash/fp/pick.js';

import {
  BATCH_UPDATE_TARGET,
  INCLUDE_ALL,
  INCLUDE_NONE_MATERIAL,
  BATCH_ENTITY,
} from '../../../../consts/batchRates.js';
import { getFilters } from './getFilters.js';

const getServicesFilters = ({ lineItems, equipmentItems, target, services, materials }) => {
  let entityType = BATCH_ENTITY[target];
  let toUpdate = pick(target)(BATCH_UPDATE_TARGET);

  if (BATCH_UPDATE_TARGET.all === target) {
    toUpdate = BATCH_UPDATE_TARGET;
    entityType = null;
  }

  const includeAllMaterials = materials?.findIndex(item => item === INCLUDE_ALL);
  const includeNonMaterial = materials?.findIndex(item => item === INCLUDE_NONE_MATERIAL);
  if (includeNonMaterial >= 0) {
    materials.splice(includeNonMaterial, 1);
  }

  const servicesFilters = {};

  const shouldGetLineItems = toUpdate.lineItems || toUpdate.recurringLineItems;
  const shouldGetServices = toUpdate.services || toUpdate.recurringServices;
  const shouldGetMaterials = includeAllMaterials > -1 || materials?.length;

  servicesFilters.lineItems = getFilters(lineItems, shouldGetLineItems);
  servicesFilters.services = getFilters(services, shouldGetServices);
  servicesFilters.equipmentItems = getFilters(equipmentItems, shouldGetServices);
  servicesFilters.materials = getFilters(materials, shouldGetMaterials);

  return { servicesFilters, includeNonMaterial: includeNonMaterial >= 0, entityType };
};

export default getServicesFilters;
