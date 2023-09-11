import Router from '@koa/router';
import httpStatus from 'http-status';
import kp from 'graphql-playground-middleware-koa';
import koaBasicAuth from 'koa-basic-auth';

import {
  API_ROOT,
  NODE_ENV,
  PLAYGROUND_ALLOWED,
  PLAYGROUND_PATH,
  PLAYGROUND_USER,
  PLAYGROUND_PASSWORD,
  GRAPHQL_PATH,
} from '../config.js';
import v1Routes from './v1/index.js';

const { default: koaPlayground } = kp;

const router = new Router();

router.get('/health-check', ctx => {
  ctx.status = httpStatus.OK;
  ctx.body = 'OK';
});
if (PLAYGROUND_USER && PLAYGROUND_PASSWORD && NODE_ENV === 'development' && PLAYGROUND_ALLOWED) {
  router.all(
    PLAYGROUND_PATH,
    async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        if (err.status === 401) {
          ctx.status = 401;
          ctx.set('WWW-Authenticate', 'Basic');
          ctx.body = 'Unauthorized.';
        } else {
          throw err;
        }
      }
    },
    koaBasicAuth({
      name: PLAYGROUND_USER,
      pass: PLAYGROUND_PASSWORD,
    }),
    koaPlayground({ endpoint: GRAPHQL_PATH }),
  );
}
router.use(`${API_ROOT}/v1`, v1Routes);

export default router.routes();
