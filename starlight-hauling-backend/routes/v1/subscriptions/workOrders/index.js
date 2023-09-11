import Router from '@koa/router';
import validate from '../../../../middlewares/validate.js';
import { editSubscriptionWorkOrderData, changeStatusData } from './schema.js';
import {
  editSubscriptionWorkOrderById,
  getSubscriptionWorkOrderById,
  changeWorkOrderStatus,
} from './controller.js';

const router = new Router();

router.get('/:id', getSubscriptionWorkOrderById);
router.put('/:id', validate(editSubscriptionWorkOrderData), editSubscriptionWorkOrderById);

// TODO remove after Route planer integration
router.patch('/:id/status', validate(changeStatusData), changeWorkOrderStatus);

export default router.routes();
