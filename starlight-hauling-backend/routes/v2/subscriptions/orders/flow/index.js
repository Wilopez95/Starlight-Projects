import Router from '@koa/router';

import validate from '../../../../../middlewares/validate.js';
import { uploadSubscriptionOrderFiles } from '../../../../../middlewares/mediaFiles.js';

import { completeOrderData, comment, unCompleteData, cancelOrderData } from './schema.js';
import {
  completeOrder,
  approveOrder,
  unapproveOrder,
  finalizeOrder,
  unfinalizeOrder,
  unCompleteOrder,
  cancelOrder,
} from './controller.js';

const router = new Router();

router.post('/complete', validate(completeOrderData), uploadSubscriptionOrderFiles, completeOrder);
router.post('/uncomplete', validate(unCompleteData), unCompleteOrder);
router.post('/approve', validate(completeOrderData), uploadSubscriptionOrderFiles, approveOrder);
router.post('/unapprove', validate(comment), unapproveOrder);
router.post('/finalize', validate(completeOrderData), uploadSubscriptionOrderFiles, finalizeOrder);
router.post('/unfinalize', validate(comment), unfinalizeOrder);
router.post('/cancel', validate(cancelOrderData), cancelOrder);

export default router.routes();
