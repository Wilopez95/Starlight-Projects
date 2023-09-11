import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import {
  disposalSiteData,
  activeOnly,
  recyclingCodesQuery,
  materialCodesQuery,
  materialCodesData,
  disposalRatesData,
  disposalRatesQuery,
} from './schema.js';
import {
  getDisposalSiteById,
  getDisposalSites,
  createDisposalSite,
  editDisposalSite,
  deleteDisposalSite,
  getRecyclingCodes,
  getMaterialCodes,
  getDisposalRates,
  mapMaterialCodes,
  updateDisposalRates,
} from './controller.js';

const router = new Router();

router.get(
  '/recycling-codes',
  authorized([PERMISSIONS.configurationDisposalSitesView]),
  validate(recyclingCodesQuery, 'query'),
  getRecyclingCodes,
);
router.get(
  '/:id/material-codes',
  authorized([PERMISSIONS.configurationDisposalSitesView]),
  validate(materialCodesQuery, 'query'),
  getMaterialCodes,
);
router.get(
  '/:id/disposal-rates',
  authorized(['configuration:operating-costs:list']),
  validate(disposalRatesQuery, 'query'),
  getDisposalRates,
);
router.get('/:id', authorized([PERMISSIONS.configurationDisposalSitesView]), getDisposalSiteById);
router.get(
  '/',
  authorized([PERMISSIONS.configurationDisposalSitesList]),
  validate(activeOnly, 'query'),
  getDisposalSites,
);

router.post(
  '/',
  authorized([PERMISSIONS.configurationDisposalSitesCreate]),
  validate(disposalSiteData),
  createDisposalSite,
);
router.put(
  '/:id',
  authorized([PERMISSIONS.configurationDisposalSitesUpdate]),
  validate(disposalSiteData),
  editDisposalSite,
);
router.delete(
  '/:id',
  authorized([PERMISSIONS.configurationDisposalSitesDelete]),
  deleteDisposalSite,
);

router.patch(
  '/:id/material-codes',
  authorized([PERMISSIONS.configurationDisposalSitesUpdate]),
  validate(materialCodesData),
  mapMaterialCodes,
);

router.patch(
  '/:id/disposal-rates',
  authorized([PERMISSIONS.configurationOperatingCostsUpdate]),
  validate(disposalRatesData),
  updateDisposalRates,
);

export default router.routes();
