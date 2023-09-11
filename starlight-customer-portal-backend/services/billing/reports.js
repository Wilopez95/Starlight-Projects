import httpStatus from 'http-status';

import { BILLING_REPORTS } from '../../consts/routes.js';
import { GET, POST } from '../../consts/methods.js';
import { RESPONSE_TYPES } from '../../consts/responseTypes.js';
import { makeBillingApiRequest } from './common.js';

export const downloadBillingReport = async (ctx) => {
  const url = `${BILLING_REPORTS}/download`;
  const result = await makeBillingApiRequest({
    ctx,
    url,
    method: GET,
    successStatus: httpStatus.OK,
    responseType: RESPONSE_TYPES.arrayBuffer,
  });
  return result;
};

export const billingReportsList = async (ctx) => {
  const url = `${BILLING_REPORTS}/customer-portal`;
  const result = await makeBillingApiRequest({
    ctx,
    url,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return result.data;
};

export const billingReportsSessionView = async (ctx) => {
  const url = `${BILLING_REPORTS}/session/view`;
  const result = await makeBillingApiRequest({
    ctx,
    url,
    method: POST,
    successStatus: httpStatus.OK,
  });
  return result.data;
};
