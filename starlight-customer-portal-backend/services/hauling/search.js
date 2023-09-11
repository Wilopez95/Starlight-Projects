import httpStatus from 'http-status';

import { HAULING_ADDRESS_SUGGESTIONS } from '../../consts/routes.js';
import { GET } from '../../consts/methods.js';
import { makeHaulingApiRequest } from './common.js';

export const searchHaulingAddressSuggestion = async (ctx) => {
  const data = await makeHaulingApiRequest({
    ctx,
    url: HAULING_ADDRESS_SUGGESTIONS,
    method: GET,
    successStatus: httpStatus.OK,
  });
  return data;
};
