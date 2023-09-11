import httpStatus from 'http-status';

import { HAULING_COMPANY } from '../../consts/routes.js';
import { GET } from '../../consts/methods.js';
import { makeHaulingApiRequest } from './common.js';

let tenantData = null;

export const getHaulingCurrentCompany = async (ctx) => {
  const data = await makeHaulingApiRequest({
    ctx,
    url: HAULING_COMPANY,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};

export const getTenantData = async (ctx) => {
  if (tenantData) {
    return tenantData;
  }

  const { tenant } = await makeHaulingApiRequest({
    ctx,
    url: HAULING_COMPANY,
    method: GET,
    successStatus: httpStatus.OK,
  });

  const { id, name } = tenant;
  tenantData = {
    tenantId: id,
    tenantName: name,
  };
  return tenantData;
};
