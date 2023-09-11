import httpStatus from 'http-status';

import { HAULING_CUSTOMERS } from '../../consts/routes.js';
import { GET, PUT } from '../../consts/methods.js';
import { makeHaulingApiRequest } from './common.js';

export const getHaulingCustomers = async (ctx) => {
  const data = await makeHaulingApiRequest({
    ctx,
    url: HAULING_CUSTOMERS,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};

export const getHaulingCustomerById = async (ctx) => {
  const { id } = ctx.params;
  const url = `${HAULING_CUSTOMERS}/${id}`;

  const data = await makeHaulingApiRequest({
    ctx,
    url,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};

export const editHaulingCustomer = async (ctx) => {
  const { id } = ctx.params;
  const url = `${HAULING_CUSTOMERS}/${id}`;

  const data = await makeHaulingApiRequest({
    ctx,
    url,
    method: PUT,
    successStatus: httpStatus.OK,
  });
  return data;
};
