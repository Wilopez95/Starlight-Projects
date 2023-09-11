import httpStatus from 'http-status';

import { BILLING_STATEMENTS } from '../../consts/routes.js';
import { GET } from '../../consts/methods.js';
import { RESPONSE_TYPES } from '../../consts/responseTypes.js';
import { makeBillingApiRequest } from './common.js';

export const downloadBillingStatements = async (ctx) => {
  const url = `${BILLING_STATEMENTS}/download`;
  const result = await makeBillingApiRequest({
    ctx,
    url,
    method: GET,
    successStatus: httpStatus.OK,
    responseType: RESPONSE_TYPES.arrayBuffer,
  });
  return result;
};
