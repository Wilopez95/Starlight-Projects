import { Context } from 'koa';
import * as Router from 'koa-router';

const router = new Router();

router.get('/', async (ctx: Context, next) => {
  ctx.body = 'Health check';
  ctx.status = 200;
  return next();
});

export default router.routes();
