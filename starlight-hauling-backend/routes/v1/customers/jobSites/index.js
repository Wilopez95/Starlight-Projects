import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { processSearchQuery } from '../../../../middlewares/requestParamsParser.js';

import {
  customerJobSiteData,
  paginated,
  mostRecentParam,
  activeOnly,
  searchParams,
} from './schema.js';
import {
  getCustomerJobSitePairById,
  getAllCustomerJobSitePairs,
  getCustomerJobSitePairs,
  getCustomerJobSiteAvailableDistricts,
  linkJobSite,
  editCustomerJobSitePair,
  searchLinkedJobSites,
} from './controller.js';

const router = new Router();

router.get(
  '/search',
  processSearchQuery.bind(null, 'address', true),
  validate(searchParams, 'query'),
  validate(activeOnly, 'query'),
  searchLinkedJobSites,
);
router.get('/:cjsPairId', getCustomerJobSitePairById);
router.get('/all', validate(activeOnly, 'query'), getAllCustomerJobSitePairs);
router.get(
  '/',
  validate(paginated, 'query'),
  validate(activeOnly, 'query'),
  validate(mostRecentParam, 'query'),
  getCustomerJobSitePairs,
);
router.put('/:jobSiteId/cjs/:id', validate(customerJobSiteData), editCustomerJobSitePair);
router.get('/:jobSiteId/tax-districts', getCustomerJobSiteAvailableDistricts);
router.post('/:jobSiteId', validate(customerJobSiteData), linkJobSite);

export default router.routes();
