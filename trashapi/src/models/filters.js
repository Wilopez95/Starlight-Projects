import { getHaulingDrivers } from '../services/hauling/drivers.js';

export const byDriverName = async (req, table) => {
  const TRUE = table.literal('TRUE');
  const {
    query: { driverName },
  } = req;
  if (!driverName) {
    return TRUE;
  }
  const drivers = await getHaulingDrivers(req, { query: driverName });
  const driverIds = drivers?.map(({ id }) => id);
  if (driverIds?.length) {
    return table.driverId.in(driverIds);
  }
  return TRUE;
};
