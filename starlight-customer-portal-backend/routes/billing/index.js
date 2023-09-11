import Router from '@koa/router';

import { authorizedMiddleware } from '../../auth/authorized.js';
import { redirectBillingRequest } from './controller.js';

const router = new Router();

router.post('/', authorizedMiddleware(), redirectBillingRequest);

export default router.routes();
