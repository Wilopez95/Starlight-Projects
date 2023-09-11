import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { processSearchQuery } from '../../../middlewares/requestParamsParser.js';
import { authorized } from '../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import {
  createRecurrentTemplateData,
  editRecurrentTemplateData,
  getRecurrentTemplatesParams,
  getRecurrentTemplateGeneratedOrdersParams,
  countParams,
} from './schema.js';
import {
  createRecurrentOrderTemplate,
  // editRecurrentOrderTemplate,
  closeRecurrentOrderTemplate,
  putRecurrentTemplateOnHold,
  putRecurrentTemplateOffHold,
  getRecurrentOrderTemplates,
  getRecurrentOrderTemplateViewDetails,
  getRecurrentOrderTemplateGeneratedOrders,
  getRecurrentOrderTemplatesCount,
  getCustomerForRecurrentOrder,
  editRecurrentOrderTemplatePricing,
} from './controller.js';

const router = new Router();

router.post(
  '/',
  authorized([PERMISSIONS.ordersNewOrder]),
  validate(createRecurrentTemplateData),
  createRecurrentOrderTemplate,
);
// router.put('/:id', authorized([PERMISSIONS.ordersEdit]), validate(editRecurrentTemplateData), editRecurrentOrderTemplate);
router.put(
  '/:id',
  authorized([PERMISSIONS.ordersEdit]),
  validate(editRecurrentTemplateData),
  // pre-pricing service code
  // editRecurrentOrderTemplate,
  editRecurrentOrderTemplatePricing,
);
router.post(
  '/:id/close',
  authorized([PERMISSIONS.ordersEndRecurrent]),
  closeRecurrentOrderTemplate,
);
router.post(
  '/:id/put-on-hold',
  authorized([PERMISSIONS.ordersHoldRecurrent]),
  putRecurrentTemplateOnHold,
);
router.post(
  '/:id/put-off-hold',
  authorized([PERMISSIONS.ordersHoldRecurrent]),
  putRecurrentTemplateOffHold,
);
router.get(
  '/',
  authorized([PERMISSIONS.ordersViewAll]),
  processSearchQuery.bind(null, 'query', false),
  validate(getRecurrentTemplatesParams, 'query'),
  getRecurrentOrderTemplates,
);
router.get(
  '/count',
  authorized([PERMISSIONS.ordersViewAll]),
  processSearchQuery.bind(null, 'query', false),
  validate(countParams, 'query'),
  getRecurrentOrderTemplatesCount,
);
router.get(
  '/:id/details',
  authorized([PERMISSIONS.ordersViewAll, PERMISSIONS.ordersViewOwn]),
  getRecurrentOrderTemplateViewDetails,
);
router.get(
  '/:id/orders',
  authorized([PERMISSIONS.ordersViewAll, PERMISSIONS.ordersViewOwn]),
  validate(getRecurrentTemplateGeneratedOrdersParams, 'query'),
  getRecurrentOrderTemplateGeneratedOrders,
);

router.get(
  '/getCustomerForRecurrentOrder',
  authorized([PERMISSIONS.ordersViewAll]),
  getCustomerForRecurrentOrder,
);

export default router.routes();
