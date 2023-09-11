import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import {
  getPurchaseOrdersSchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
} from './schema.js';

import {
  getPurchaseOrders,
  createPurchaseOrder,
  getPurchaseOrderById,
  editPurchaseOrder,
} from './controller.js';

const router = new Router();

router.get('/', validate(getPurchaseOrdersSchema, 'query'), getPurchaseOrders);
router.get('/:id', getPurchaseOrderById);
router.post('/', validate(createPurchaseOrderSchema), createPurchaseOrder);
router.put('/:id', validate(updatePurchaseOrderSchema), editPurchaseOrder);

export default router.routes();
