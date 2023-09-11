import Router from '@koa/router';

import { authorizedMiddleware } from '../../auth/authorized.js';
import { redirectUmsRequest } from './controller.js';

const router = new Router();

router.post('/', authorizedMiddleware(), redirectUmsRequest);

export default router.routes();
