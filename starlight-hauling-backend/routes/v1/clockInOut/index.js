import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { clockInData, clockOutData } from './schema.js';
import { clockIn, clockOut, getCurrent } from './controller.js';

const router = new Router();

router.post('/clockin', validate(clockInData), clockIn);
router.post('/clockout', validate(clockOutData), clockOut);

router.get('/current', getCurrent);

export default router.routes();
