import { getHaulingDriverById } from '../services/hauling/drivers.js';
import asyncWrap from '../utils/asyncWrap.js';
import { findAll } from '../models/trucks-and-drivers.js';
import { checkCoreHeaderValue } from '../utils/helpers.js';

export const readWith = ({ model, view, instance }) =>
  asyncWrap(async (req, res) => {
    const item = req[instance];
    if (item) {
      const driver = checkCoreHeaderValue(req)
        ? { id: item.driverId }
        : (await getHaulingDriverById(req, item.driverId)) ?? {};
      item.driver = driver;
      item.truck = driver?.truck ?? {};
      return res.send(view(item));
    }

    const list = await findAll({ req, model, view });
    return res.send(list);
  });

export default {
  readWith,
};
