import httpStatus from 'http-status';

import { HAULING_DISPOSAL_SITES } from '../../consts/routes.js';
import { GET } from '../../consts/methods.js';
import { disposalSiteView } from '../../views/disposal-sites.js';
import { makeHaulingApiRequest } from './common.js';

export const getDisposalSiteByDescription = async (req, description) => {
  if (!description) {
    return null;
  }

  const url = `${HAULING_DISPOSAL_SITES}?description=${description}`;
  const result = await makeHaulingApiRequest({
    req,
    url,
    method: GET,
    successStatus: httpStatus.OK,
  });

  if (!result.length) {
    throw new Error(`Disposal site with description: ${description} not found in Hauling.`);
  }

  return disposalSiteView(result[0]);
};
