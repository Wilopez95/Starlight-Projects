import Router from '@koa/router';

import { authorized } from '../../../middlewares/authorized.js';
import businessUnitsRouter from './businessUnits.js';
import trucksRouter from './trucks.js';
import driversRouter from './drivers.js';

const router = new Router();

router.use('/business-units', authorized(), businessUnitsRouter);
router.use('/trucks', authorized(), trucksRouter);
router.use('/drivers', authorized(), driversRouter);

export default router.routes();
