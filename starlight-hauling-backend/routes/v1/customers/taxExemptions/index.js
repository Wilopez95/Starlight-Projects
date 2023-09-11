import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { authorized } from '../../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../../consts/permissions.js';
import { taxExemptionsData, taxExemptionsPostData } from './schema.js';
import {
  getCustomerTaxExemptions,
  getCustomerJobSiteTaxExemptions,
  updateCustomerTaxExemptions,
  updateCustomerJobSiteTaxExemptions,
} from './controller.js';

const router = new Router();

router.get('/', authorized([PERMISSIONS.customersTaxExempts]), getCustomerTaxExemptions);
router.get(
  '/:jobSiteId',
  authorized([PERMISSIONS.customersTaxExempts]),
  getCustomerJobSiteTaxExemptions,
);
router.post(
  '/',
  authorized([PERMISSIONS.customersTaxExempts]),
  validate(taxExemptionsPostData),
  updateCustomerTaxExemptions,
);
router.post(
  '/:jobSiteId',
  authorized([PERMISSIONS.customersTaxExempts]),
  validate(taxExemptionsData),
  updateCustomerJobSiteTaxExemptions,
);

export default router.routes();
