import Router from '@koa/router';

import { salesPointApiAccess } from '../../middlewares/auth.js';

import { authorized } from '../../middlewares/authorized.js';
import customerRoutes from './customers/index.js';
import orderRoutes from './orders/index.js';
import recurrentOrderRoutes from './recurrentOrders/index.js';
import subscriptionRoutes from './subscriptions/index.js';
import salesPointRoutes from './salespoint/index.js';

const router = new Router();

router.use('/customers', authorized(), customerRoutes);
router.use('/orders', authorized(), orderRoutes);
router.use('/subscriptions', authorized(), subscriptionRoutes);
router.use('/recurrent-orders', authorized(), recurrentOrderRoutes);
router.use('/sales-point', salesPointApiAccess, salesPointRoutes);

export default router.routes();
