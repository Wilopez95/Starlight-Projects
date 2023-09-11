import Router from '@koa/router';

import { clearCache } from './controller.js';

const router = new Router();

router.delete('/', clearCache);

export default router.routes();
