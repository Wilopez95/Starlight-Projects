import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';
import { skipBodyLogging } from '../../../middlewares/logger.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import { billableServiceData, queryParams, recurringServiceRateIds, qbParams } from './schema.js';
import {
  getBillableServiceById,
  getHistoricalBillableServiceById,
  getBillableServices,
  createBillableService,
  editBillableService,
  deleteBillableService,
  getBillableServiceFrequencies,
  getBillableServicesQBData,
} from './controller.js';

const router = new Router();

router.get(
  '/historical/:billableServicesId',
  authorized([PERMISSIONS.configurationBillableItemsList]),
  getHistoricalBillableServiceById,
);
router.get(
  '/',
  authorized([PERMISSIONS.configurationBillableItemsList]),
  validate(queryParams, 'query'),
  getBillableServices,
);
router.get('/qb', validate(qbParams, 'query'), skipBodyLogging, getBillableServicesQBData);
router.get(
  '/:id',
  authorized([PERMISSIONS.configurationBillableItemsView]),
  getBillableServiceById,
);
router.post(
  '/',
  authorized([PERMISSIONS.configurationBillableItemsCreate]),
  validate(billableServiceData),
  createBillableService,
);
router.get(
  '/:id/frequencies',
  authorized([
    PERMISSIONS.configurationBillableItemsView,
    PERMISSIONS.configurationBillableItemsList,
  ]),
  validate(recurringServiceRateIds, 'query'),
  getBillableServiceFrequencies,
);
router.put(
  '/:id',
  authorized([PERMISSIONS.configurationBillableItemsUpdate]),
  validate(billableServiceData),
  editBillableService,
);
router.delete(
  '/:id',
  authorized([PERMISSIONS.configurationBillableItemsDelete]),
  deleteBillableService,
);

export default router.routes();
