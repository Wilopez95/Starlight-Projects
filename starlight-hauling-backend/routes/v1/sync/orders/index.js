import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { syncOrdersParams } from './schema.js';

import { syncOrders } from './controller.js';

const router = new Router();

router.post('/', validate(syncOrdersParams), syncOrders);

export default router.routes();
