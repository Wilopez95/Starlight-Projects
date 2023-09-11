import Router from '@koa/router';

import { testIntegration, getRates } from './controller.js';

const router = new Router();

router.head('/integration/test', testIntegration);

router.get('/rates', getRates);

export default router.routes();
