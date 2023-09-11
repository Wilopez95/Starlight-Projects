import Router from '@koa/router';

import { authorizedMiddleware } from '../../../auth/authorized.js';
import { getAvailableResourcesToLogin } from './controller.js';

const router = new Router();

router.get('/available-resource-logins', authorizedMiddleware(), getAvailableResourcesToLogin);

export default router.routes();
