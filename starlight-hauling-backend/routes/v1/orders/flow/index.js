import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { uploadWorkOrderMediaFiles } from '../../../../middlewares/mediaFiles.js';
import { authorized } from '../../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../../consts/permissions.js';
import { changeStatusData, completeOrderData, cancelOrderData, comment } from './schema.js';
import {
  syncWithDispatch,
  cancelOrder,
  completeOrder,
  approveOrder,
  unapproveOrder,
  finalizeOrder,
  unfinalizeOrder,
  changeOrderStatus,
} from './controller.js';

const router = new Router();

router.patch('/dispatch-sync', syncWithDispatch);

router.post(
  '/cancel',
  authorized([PERMISSIONS.ordersCancel]),
  validate(cancelOrderData),
  cancelOrder,
);
router.post(
  '/complete',
  authorized([PERMISSIONS.ordersComplete]),
  validate(completeOrderData),
  uploadWorkOrderMediaFiles.bind(null, false),
  completeOrder,
);
router.post(
  '/approve',
  authorized([PERMISSIONS.ordersApprove]),
  validate(completeOrderData),
  uploadWorkOrderMediaFiles.bind(null, false),
  approveOrder,
);
router.post(
  '/unapprove',
  authorized([PERMISSIONS.ordersUnApprove]),
  validate(comment),
  unapproveOrder,
);
router.post(
  '/finalize',
  authorized([PERMISSIONS.ordersFinalize]),
  validate(completeOrderData),
  uploadWorkOrderMediaFiles.bind(null, false),
  finalizeOrder,
);
router.post(
  '/unfinalize',
  authorized([PERMISSIONS.ordersUnFinalize]),
  validate(comment),
  unfinalizeOrder,
);

// TODO: temp one for testing purposes
router.patch('/status', validate(changeStatusData), changeOrderStatus);

export default router.routes();
