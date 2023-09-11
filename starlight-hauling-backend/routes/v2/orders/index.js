import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { processSearchQuery } from '../../../middlewares/requestParamsParser.js';
import { uploadWorkOrderMediaFiles } from '../../../middlewares/mediaFiles.js';
import { authorized } from '../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import {
  createOrdersData,
  editOrderData,
  queryParams,
  detailsLevel,
  countParams,
  rescheduleOrderData,
  applyMultiple,
  validOnly,
  droppedCanParams,
  newPrepaidPayment,
  deleteMediaFileParams,
  paginationParams,
} from './schema.js';
import {
  getOrders,
  getOrdersCount,
  getDroppedEquipmentItems,
  getOrderById,
  getWoMediaFiles,
  createOrders,
  editOrder,
  rescheduleOrder,
  checkOrdersToApprove,
  approveOrders,
  unapproveOrders,
  checkOrdersToFinalize,
  finalizeOrders,
  refundWrongCcPayment,
  deleteMediaFile,
  getOrderHistory,
  getOrderRequestById,
  getOrderRequests,
  getOrderRequestsCount,
  rejectOrderRequest,
  createIndependentWorkOrderMedia,
} from './controller.js';

import orderFlowRoutes from './flow/index.js';
import orderInvoicingRoutes from './invoicing/index.js';
import workOrderRoutes from './workOrders/index.js';
import workOrdersMediaRouter from './independentWOMedia/index.js';

const router = new Router();

router.use('/independent-work-order-media', workOrdersMediaRouter);
router.use('/invoicing', orderInvoicingRoutes);
router.use('/work-orders/:woNumber', workOrderRoutes);
router.use('/:id', orderFlowRoutes);

router.get(
  '/count',
  authorized([PERMISSIONS.ordersViewAll, PERMISSIONS.ordersViewOwn]),
  processSearchQuery.bind(null, 'query', false),
  validate(countParams, 'query'),
  getOrdersCount,
);
router.get(
  '/',
  authorized([PERMISSIONS.ordersViewAll, PERMISSIONS.ordersViewOwn]),
  processSearchQuery.bind(null, 'query', false),
  validate(queryParams, 'query'),
  getOrders,
);

router.get(
  '/dropped-cans',
  authorized([PERMISSIONS.configurationEquipmentView]),
  authorized([PERMISSIONS.ordersViewAll, PERMISSIONS.ordersViewOwn]),
  validate(droppedCanParams, 'query'),
  getDroppedEquipmentItems,
);

router.get('/requests', validate(paginationParams, 'query'), getOrderRequests);
router.get('/requests/count', getOrderRequestsCount);
router.get('/requests/:id', getOrderRequestById);
router.patch('/requests/:id', rejectOrderRequest);

router.get(
  '/:id/media-files/:workOrderId',
  authorized([PERMISSIONS.ordersViewAll, PERMISSIONS.ordersViewOwn]),
  getWoMediaFiles,
);
router.get(
  '/:id',
  authorized([PERMISSIONS.ordersViewAll, PERMISSIONS.ordersViewOwn]),
  validate(detailsLevel, 'query'),
  getOrderById,
);
router.post(
  '/',
  authorized([PERMISSIONS.ordersNewOrder]),
  validate(createOrdersData),
  uploadWorkOrderMediaFiles.bind(null, true),
  createOrders,
);
router.put(
  '/:id',
  authorized([PERMISSIONS.ordersEdit]),
  validate(editOrderData),
  // uploadWorkOrderMediaFiles,
  editOrder,
);
router.post(
  '/:id/refund-wrong-cc',
  authorized([PERMISSIONS.ordersEdit]),
  validate(newPrepaidPayment),
  refundWrongCcPayment,
);
router.patch(
  '/:id/reschedule',
  authorized([PERMISSIONS.ordersEdit]),
  validate(rescheduleOrderData),
  rescheduleOrder,
);

router.post(
  '/approve/validate',
  authorized([PERMISSIONS.ordersApprove]),
  validate(applyMultiple),
  checkOrdersToApprove,
);
router.post(
  '/approve',
  authorized([PERMISSIONS.ordersApprove]),
  validate(applyMultiple),
  validate(validOnly),
  approveOrders,
);
router.post(
  '/unapprove',
  authorized([PERMISSIONS.ordersUnApprove]),
  validate(applyMultiple),
  unapproveOrders,
);
router.post(
  '/finalize/validate',
  authorized([PERMISSIONS.ordersFinalize]),
  validate(applyMultiple),
  checkOrdersToFinalize,
);
router.post(
  '/finalize',
  authorized([PERMISSIONS.ordersFinalize]),
  validate(applyMultiple),
  validate(validOnly),
  finalizeOrders,
);

router.delete(
  '/media/:woNumber',
  authorized([PERMISSIONS.ordersEdit]),
  validate(deleteMediaFileParams, 'query'),
  deleteMediaFile,
);

router.post('/media/:independentWorkOrderId', createIndependentWorkOrderMedia);

router.get(
  '/:id/history',
  authorized([PERMISSIONS.ordersViewAll, PERMISSIONS.ordersViewOwn]),
  getOrderHistory,
);

export default router.routes();
