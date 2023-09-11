import querystring from 'querystring';
import Router from '@koa/router';
import { FRONTEND_URL, LOBBY_RESOURCE } from '../../../config.js';
import { buildAuthRouter } from '../../../auth/router.js';
import { authorizedMiddleware } from '../../../auth/authorized.js';
import getResource from '../../../utils/getResource.js';

const router = new Router();

const getFrontendUrl = (ctx) => {
  if (ctx.headers.referer) {
    const url = new URL(ctx.headers.referer);

    return `${url.protocol}//${url.host}`;
  }

  return FRONTEND_URL;
};

const lobbyAuthRouter = buildAuthRouter({
  getFrontendUrl,
  getResource: () => Promise.resolve(LOBBY_RESOURCE),
  getResourceUrlPart: () => '/lobby',
});

const customerAuthRouter = buildAuthRouter({
  getFrontendUrl,
  getResource: (ctx) => Promise.resolve(getResource(ctx.params.customerId)),
  getResourceUrlPart: (ctx) => `/customers/${ctx.params.customerId}`,
  redirectToLogin: (ctx, queryParams) => {
    ctx.redirect(`${FRONTEND_URL}/lobby?${querystring.stringify(queryParams)}`);
  },
});

router.use('/lobby', lobbyAuthRouter.allowedMethods(), lobbyAuthRouter.routes());
router.use(
  '/customers/:customerId',
  customerAuthRouter.allowedMethods(),
  customerAuthRouter.routes(),
);
router.get('/me', authorizedMiddleware(), (ctx) => {
  ctx.body = ctx.state.user;
  ctx.status = 200;
});

export default router.routes();
