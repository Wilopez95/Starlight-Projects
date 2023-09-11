import Router from '@koa/router';

import { API_PATH, API_V2_PATH } from '../config.js';
import routesV1 from './v1/index.js';
import routesV2 from './v2/index.js';

export const buildRouter = () => {
  const router = new Router();

  router.get('/health-check', ctx => {
    ctx.status = 200;
    ctx.body = 'OK';
  });
  router.use(API_PATH, routesV1);
  router.use(API_V2_PATH, routesV2);

  return router;
};
