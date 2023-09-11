import groupBy from 'lodash/groupBy.js';

import { my } from '../utils/query.js';
import { getHaulingDrivers } from '../services/hauling/drivers.js';
import { checkCoreHeaderValue } from '../utils/helpers.js';

export const findAll = async ({ req, model, view }) => {
  const items = await my(model.findAll(req), req.user);
  let driversById;

  const driverIds = items?.map(({ driverId }) => driverId).filter(Boolean);

  if (driverIds?.length) {
    // The request it makes looks like /api/v1/trash-api/drivers?...driverIds=1%2C1%2C1%2C1
    // and results in [1,1,1,1,1] which is stupid.
    // Would be looking up the same driver multiple times
    const uniqueDriverIds = Array.from(new Set(driverIds));
    const drivers = checkCoreHeaderValue(req)
      ? uniqueDriverIds.map(driverId => ({ id: driverId }))
      : (await getHaulingDrivers(req, { uniqueDriverIds })) ?? [];
    driversById = groupBy(drivers, 'id');
  }

  return (
    items?.map(item => {
      const driver = driversById?.[item.driverId]?.[0] ?? {};
      item.driver = driver ?? {};
      item.truck = driver?.truck ?? {};
      return view(item);
    }) ?? []
  );
};

export default {
  findAll,
};
