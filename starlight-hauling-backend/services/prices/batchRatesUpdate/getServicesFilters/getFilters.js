import { INCLUDE_ALL } from '../../../../consts/batchRates.js';

export const getFilters = (service, getService) => {
  if (!getService || !service?.length) {
    return { getAll: false, ids: [] };
  }
  const includeAll = service.findIndex(item => item === INCLUDE_ALL);

  if (includeAll >= 0) {
    service.splice(includeAll, 1);
    return { getAll: true, ids: [] };
  }

  if (includeAll === -1 && service.length) {
    return { getAll: false, ids: service };
  }
  return { getAll: false, ids: [] };
};
