import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';

import {
  billableServiceId,
  materialId,
  activeOnly,
  businessLineId,
  getDisposalSitesQueryParams,
} from './schema.js';
import {
  autoSyncWithDispatch,
  getBillableServices,
  getMaterials,
  getDisposalSites,
} from './controller.js';

const router = new Router();

router.post('/sync', autoSyncWithDispatch);

// haulingBillableServiceId
router.get(
  '/billable-services',
  validate(materialId, 'query'),
  validate(activeOnly, 'query'),
  validate(businessLineId, 'query'),
  getBillableServices,
);
// haulingMaterialId
router.get(
  '/materials',
  validate(billableServiceId, 'query'),
  validate(activeOnly, 'query'),
  validate(businessLineId, 'query'),
  getMaterials,
);
// haulingDisposalSiteId (if action fits)
router.get('/disposal-sites', validate(getDisposalSitesQueryParams, 'query'), getDisposalSites);

export default router.routes();
