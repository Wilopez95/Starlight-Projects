import Router from '@koa/router';

import { getAvailableResoucesToLogin } from './controller.js';

const router = new Router();

router.get('/available-resource-logins', getAvailableResoucesToLogin);

export default router.routes();
