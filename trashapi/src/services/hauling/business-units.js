import httpStatus from 'http-status';

import { HAULING_BUSINESS_UNITS } from '../../consts/routes.js';
import { GET } from '../../consts/methods.js';
import { BUSINESS_LINE_TYPES } from '../../consts/businessLines.js';
import { BUSINESS_UNIT_TYPES } from '../../consts/businessUnits.js';
import { makeHaulingApiRequest } from './common.js';

const isHaulingBU = ({ type } = {}) => type === BUSINESS_UNIT_TYPES.hauling;
const isRollOffBU = ({ businessLines = [] } = {}) =>
  businessLines?.some(({ type } = {}) => type === BUSINESS_LINE_TYPES.rollOff);
// for Dispatch/Driver allowed only Hauling type and Roll Off (Business Line type) Business Units
const filterBusinessUnits = data => data?.filter(item => isHaulingBU(item) && isRollOffBU(item));

export const getHaulingBusinessUnits = async req => {
  const data = await makeHaulingApiRequest({
    req,
    url: HAULING_BUSINESS_UNITS,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return filterBusinessUnits(data);
};
