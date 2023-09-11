import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';
import { skipBodyLogging } from '../../../middlewares/logger.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import {
  createBillableLineItemData,
  editBillableLineItemData,
  queryParams,
  qbParams,
} from './schema.js';
import {
  getBillableLineItems,
  createBillableLineItem,
  editBillableLineItem,
  deleteBillableLineItem,
  getBillableLineItemById,
  getBillableLineItemsQBData,
} from './controller.js';

const router = new Router();

router.get(
  '/',
  authorized([PERMISSIONS.configurationBillableItemsList]),
  validate(queryParams, 'query'),
  getBillableLineItems,
);
router.get('/qb', validate(qbParams, 'query'), skipBodyLogging, getBillableLineItemsQBData);
router.get(
  '/:id',
  authorized([PERMISSIONS.configurationBillableItemsView]),
  getBillableLineItemById,
);
router.post(
  '/',
  authorized([PERMISSIONS.configurationBillableItemsCreate]),
  validate(createBillableLineItemData),
  createBillableLineItem,
);
router.put(
  '/:id',
  authorized([PERMISSIONS.configurationBillableItemsUpdate]),
  validate(editBillableLineItemData),
  editBillableLineItem,
);
router.delete(
  '/:id',
  authorized([PERMISSIONS.configurationBillableItemsDelete]),
  deleteBillableLineItem,
);

export default router.routes();
