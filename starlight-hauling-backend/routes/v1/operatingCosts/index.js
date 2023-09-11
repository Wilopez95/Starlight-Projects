import Router from '@koa/router';

import truckDriverCostsRoutes from './truckDriverCosts/index.js';

const router = new Router();

router.use('/truck-driver-costs', truckDriverCostsRoutes);

export default router.routes();
