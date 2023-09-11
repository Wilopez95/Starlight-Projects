import Router from '@koa/router';

import { graphql } from './controller.js';

const router = new Router();

router.post('/graphql', graphql);

export default router.routes();
