import Router from '@koa/router';

import ordersRoutes from './orders/index.js';
import businessLinesRoutes from './businessLine/index.js';
import jobSitesRoutes from './jobSites/index.js';
import customersRoutes from './customers/index.js';

const router = new Router();

router.use('/orders', ordersRoutes);
router.use('/business-lines', businessLinesRoutes);
router.use('/job-sites', jobSitesRoutes);
router.use('/customers', customersRoutes);

export default router.routes();
