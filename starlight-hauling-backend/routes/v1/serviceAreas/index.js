import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';
import { PERMISSIONS } from '../../../consts/permissions.js';
import {
  serviceAreaData,
  serviceAreaEdit,
  serviceAreasByIds,
  serviceAreasByJobSite,
  duplicate,
  queryParams,
} from './schema.js';

import {
  getServiceAreasPaginated,
  getServiceAreaByIds,
  getServiceAreaById,
  createServiceArea,
  editServiceArea,
  duplicateServiceArea,
  deleteServiceArea,
  matchedServiceAreas,
} from './controller.js';

const router = new Router();

router.get('/matched', validate(serviceAreasByJobSite, 'query'), matchedServiceAreas);
router.get(
  '/',
  authorized([PERMISSIONS.configurationServiceAreasList]),
  validate(queryParams, 'query'),
  getServiceAreasPaginated,
);
router.post(
  '/ids',
  authorized([PERMISSIONS.configurationServiceAreasList]),
  validate(serviceAreasByIds),
  getServiceAreaByIds,
);
router.get('/:id', authorized([PERMISSIONS.configurationServiceAreasView]), getServiceAreaById);

router.post(
  '/:id/duplicate',
  authorized([PERMISSIONS.configurationServiceAreasCreate]),
  validate(duplicate),
  duplicateServiceArea,
);

router.post(
  '/',
  authorized([PERMISSIONS.configurationServiceAreasCreate]),
  validate(serviceAreaData),
  createServiceArea,
);
router.patch(
  '/:id',
  authorized([PERMISSIONS.configurationServiceAreasUpdate]),
  validate(serviceAreaEdit),
  editServiceArea,
);
router.delete('/:id', authorized([PERMISSIONS.configurationServiceAreasDelete]), deleteServiceArea);

export default router.routes();
