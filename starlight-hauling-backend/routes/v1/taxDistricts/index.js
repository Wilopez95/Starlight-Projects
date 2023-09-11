import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { skipBodyLogging } from '../../../middlewares/logger.js';
import { authorized } from '../../../middlewares/authorized.js';
import { processSearchQuery } from '../../../middlewares/requestParamsParser.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import {
  createDistrictData,
  editDistrictData,
  taxes,
  activeOnly,
  searchParams,
  taxesKey,
  qbSumParams,
  qbParams,
  getRecyclingDistrictsParams,
} from './schema.js';
import {
  getTaxDistrictById,
  getTaxDistricts,
  createTaxDistrict,
  editTaxDistrict,
  editTaxDistrictTaxes,
  deleteTaxDistrict,
  searchAdministrativeUnits,
  getTaxesQBData,
  getTaxesSumQBData,
  getRecyclingDistricts,
} from './controller.js';

const router = new Router();

router.get(
  '/',
  authorized([PERMISSIONS.configurationTaxDistrictsList]),
  validate(activeOnly, 'query'),
  getTaxDistricts,
);
router.get('/qb', validate(qbParams, 'query'), skipBodyLogging, getTaxesQBData);
router.get('/qb-sum', validate(qbSumParams, 'query'), getTaxesSumQBData);

router.get(
  '/administrative-units',
  authorized([
    PERMISSIONS.configurationTaxDistrictsUpdate,
    PERMISSIONS.configurationTaxDistrictsCreate,
  ]),
  processSearchQuery.bind(null, 'query', true),
  validate(searchParams, 'query'),
  searchAdministrativeUnits,
);
router.get('/recycling', validate(getRecyclingDistrictsParams, 'query'), getRecyclingDistricts);
router.get('/:id', authorized([PERMISSIONS.configurationTaxDistrictsView]), getTaxDistrictById);
router.post(
  '/',
  authorized([PERMISSIONS.configurationTaxDistrictsCreate]),
  validate(createDistrictData),
  createTaxDistrict,
);
router.put(
  '/:id/:key',
  authorized([PERMISSIONS.configurationTaxDistrictsUpdate]),
  validate(taxesKey, 'params'),
  validate(taxes),
  editTaxDistrictTaxes,
);
router.patch(
  '/:id',
  authorized([PERMISSIONS.configurationTaxDistrictsUpdate]),
  validate(editDistrictData),
  editTaxDistrict,
);
router.delete('/:id', authorized([PERMISSIONS.configurationTaxDistrictsDelete]), deleteTaxDistrict);

export default router.routes();
