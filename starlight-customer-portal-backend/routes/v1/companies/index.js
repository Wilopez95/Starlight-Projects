import Router from '@koa/router';

import { getCurrentCompany } from './controller.js';

const router = new Router();

router.get('/current', getCurrentCompany);

export default router.routes();
