import Router from '@koa/router';

import { castQueryParams } from '../../middlewares/requestParamsParser.js';

const router = new Router();

router.use(castQueryParams);

// TODO: here will go RESTful routes

export default router.routes();
