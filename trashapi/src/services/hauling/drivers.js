import httpStatus from 'http-status';

import { HAULING_DRIVERS } from '../../consts/routes.js';
import { GET, PUT } from '../../consts/methods.js';
import { driversListView, driverView } from '../../views/driver.js';
import { makeHaulingApiRequest } from './common.js';

export const getHaulingDrivers = async (req, data = {}) => {
  data.filterByBusinessUnit = req.query.businessUnitId;
  const result = await makeHaulingApiRequest({
    req,
    url: HAULING_DRIVERS,
    method: GET,
    successStatus: httpStatus.OK,
    data,
  });
  return result?.length ? driversListView(result) : result;
};

export const getHaulingDriverById = async (req, driverId) => {
  if (!driverId) {
    return null;
  }

  const url = `${HAULING_DRIVERS}/${driverId}`;
  const result = await makeHaulingApiRequest({
    req,
    url,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return result && driverView(result);
};

export const updateHaulingDriver = async req => {
  const url = `${HAULING_DRIVERS}/${req.params.id}`;
  const result = await makeHaulingApiRequest({
    req,
    url,
    method: PUT,
    successStatus: httpStatus.OK,
  });
  return result && driverView(result);
};
