import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { processSearchQuery } from '../../../middlewares/requestParamsParser.js';
import { skipBodyLogging } from '../../../middlewares/logger.js';

import {
  countParams,
  paginated,
  jobSiteData,
  searchParams,
  linkToParams,
  taxDistricts,
  getByIdQuery,
} from './schema.js';
import {
  getJobSites,
  getJobSitesCount,
  getJobSiteById,
  searchJobSites,
  createJobSite,
  editJobSite,
  deleteJobSite,
  getLinkedCustomers,
  updateDefaultTaxDistricts,
  getAllJobSitesQB,
} from './controller.js';

import importRoutes from './import/index.js';

const router = new Router();

router.use('/import', importRoutes);

router.get('/qb', skipBodyLogging, getAllJobSitesQB);

router.get(
  '/search',
  processSearchQuery.bind(null, 'address', true),
  validate(searchParams, 'query'),
  searchJobSites,
);

router.get(
  '/count',
  processSearchQuery.bind(null, 'query', false),
  validate(countParams, 'query'),
  getJobSitesCount,
);
router.get(
  '/',
  processSearchQuery.bind(null, 'query', false),
  validate(paginated, 'query'),
  getJobSites,
);

router.get('/:jobSiteId/customers', getLinkedCustomers);

router.get('/:id', validate(getByIdQuery), getJobSiteById);
router.post('/', validate(linkToParams, 'query'), validate(jobSiteData), createJobSite);
router.put('/:id', validate(jobSiteData), editJobSite);
router.delete('/:id', deleteJobSite);

router.put('/:id/tax-districts', validate(taxDistricts), updateDefaultTaxDistricts);

export default router.routes();
