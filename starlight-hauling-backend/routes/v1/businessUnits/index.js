import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { processSearchQuery } from '../../../middlewares/requestParamsParser.js';

import { authorized } from '../../../middlewares/authorized.js';
import { PERMISSIONS } from '../../../consts/permissions.js';
import {
  addBusinessLinesData,
  createBusinessUnitData,
  updateBusinessUnitData,
  activeOnly,
  recyclingFacilitiesQuery,
  updateBusinessUnitMailSettings as updateBusinessUnitMailSettingsSchema,
  confirmed,
  serviceDaysData,
} from './schema.js';

import {
  addBusinessLines,
  getBusinessUnits,
  getBusinessUnitById,
  createBusinessUnit,
  editBusinessUnit,
  deleteBusinessUnit,
  searchRecyclingFacilities,
  getBusinessUnitMailSettings,
  updateBusinessUnitMailSettings,
  getBusinessUnitMerchants,
  updateBusinessLines,
  getBUServiceDays,
  addBUServiceDays,
  updateBUServiceDays,
} from './controller.js';

const router = new Router();

router.get(
  '/recycling-facilities',
  processSearchQuery.bind(null, 'query', true),
  validate(recyclingFacilitiesQuery, 'query'),
  searchRecyclingFacilities,
);

router.get(
  '/',
  authorized([PERMISSIONS.configurationBusinessUnitsList]),
  validate(activeOnly, 'query'),
  getBusinessUnits,
);
router.get(
  '/:id',
  authorized([PERMISSIONS.configurationBusinessUnitsView, PERMISSIONS.recyclingYardConsoleView]),
  getBusinessUnitById,
);
router.get(
  '/:id/merchants',
  authorized([PERMISSIONS.configurationBusinessUnitsView]),
  getBusinessUnitMerchants,
);
router.post(
  '/',
  authorized([PERMISSIONS.configurationBusinessUnitsCreate]),
  validate(createBusinessUnitData),
  createBusinessUnit,
);
router.post(
  '/:id/business-lines',
  authorized([PERMISSIONS.configurationBusinessUnitsUpdate]),
  validate(addBusinessLinesData),
  addBusinessLines,
);

router.put(
  '/:id/business-lines',
  authorized([PERMISSIONS.configurationBusinessUnitsUpdate]),
  validate(addBusinessLinesData),
  updateBusinessLines,
);

router.get(
  '/:id/service-days',
  authorized([PERMISSIONS.configurationBusinessUnitsView]),
  getBUServiceDays,
);
router.post(
  '/:id/service-days',
  authorized([PERMISSIONS.configurationBusinessUnitsCreate]),
  validate(serviceDaysData),
  addBUServiceDays,
);
router.put(
  '/:id/service-days',
  authorized([PERMISSIONS.configurationBusinessUnitsUpdate]),
  validate(serviceDaysData),
  updateBUServiceDays,
);

router.put(
  '/:id',
  authorized([PERMISSIONS.configurationBusinessUnitsUpdate]),
  validate(updateBusinessUnitData),
  editBusinessUnit,
);
router.get(
  '/:id/mailing-settings',
  authorized([PERMISSIONS.configurationBusinessUnitsView]),
  getBusinessUnitMailSettings,
);
router.put(
  '/:id/mailing-settings',
  authorized([PERMISSIONS.configurationBusinessUnitsUpdate]),
  validate(updateBusinessUnitMailSettingsSchema),
  updateBusinessUnitMailSettings,
);
router.delete(
  '/:id',
  authorized([PERMISSIONS.configurationBusinessUnitsDelete]),
  validate(confirmed, 'query'),
  deleteBusinessUnit,
);

export default router.routes();
