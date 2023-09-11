import Router from '@koa/router';
import httpStatus from 'http-status';

import { API_ROOT } from '../config.js';
import v1Routes from './v1/index.js';
import billingRoutes from './billing/index.js';
import umsRoutes from './ums/index.js';

const router = new Router();

router.get('/health-check', (ctx) => {
  ctx.status = httpStatus.OK;
  ctx.body = 'OK';
});

router.use(`${API_ROOT}/v1`, v1Routes);
router.use(`${API_ROOT}/billing/graphql`, billingRoutes);
router.use(`${API_ROOT}/ums/graphql`, umsRoutes);

export default router.routes();
