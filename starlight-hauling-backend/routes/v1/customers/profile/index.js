import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { authorized } from '../../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../../consts/permissions.js';
import { activeOnly, jobSiteIdParam, projectIdParam, paginationParams } from './schema.js';
import { getJobSiteOrderContacts, getOpenOrders, getInvoicedOrders } from './controller.js';
import commentRoutes from './comments/index.js';

const router = new Router();

router.use('/comments', commentRoutes);

router.get(
  '/contacts',
  validate(activeOnly, 'query'),
  validate(jobSiteIdParam, 'query'),
  validate(paginationParams, 'query'),
  getJobSiteOrderContacts,
);

router.get(
  '/open-orders',
  authorized([PERMISSIONS.ordersViewAll]),
  validate(jobSiteIdParam, 'query'),
  validate(projectIdParam, 'query'),
  validate(paginationParams, 'query'),
  getOpenOrders,
);
router.get(
  '/invoiced-orders',
  authorized([PERMISSIONS.ordersViewAll]),
  validate(jobSiteIdParam, 'query'),
  validate(projectIdParam, 'query'),
  validate(paginationParams, 'query'),
  getInvoicedOrders,
);

export default router.routes();
