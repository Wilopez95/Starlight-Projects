import querystring from 'querystring';
import Router from '@koa/router';

import { FE_HOST } from '../../../config.js';
import validate from '../../../middlewares/validate.js';

import { authorized } from '../../../middlewares/authorized.js';
import BusinessUnitRepository from '../../../repos/businessUnit.js';
import { BUSINESS_UNIT_TYPE } from '../../../consts/businessUnitTypes.js';
import { getTokenParams } from './schema.js';
import { getAccessToken, LOBBY_RESOURCE } from './controller.js';
import { buildAuthRouter } from './router.js';

const router = new Router();

const lobbyAuthRouter = buildAuthRouter({
  getFrontendUrl: ctx => {
    if (ctx.headers.referer) {
      const url = new URL(ctx.headers.referer);

      return `${url.protocol}//${url.host}`;
    }

    return FE_HOST;
  },
  getResource: () => Promise.resolve(LOBBY_RESOURCE),
  getResourceUrlPart: () => '/lobby',
});
const configurationAuthRouter = buildAuthRouter({
  getFrontendUrl: () => FE_HOST,
  getResource: ctx => `srn:${ctx.params.tenantName}:global:global`,
  getResourceUrlPart: ctx => `/${ctx.params.tenantName}/configuration`,
  redirectToLogin: (ctx, queryParams) => {
    ctx.redirect(`${FE_HOST}/lobby?${querystring.stringify(queryParams)}`);
  },
});
const businessUnitAuthRouter = buildAuthRouter({
  getFrontendUrl: ctx => {
    if (ctx.headers.referer) {
      const url = new URL(ctx.headers.referer);

      return `${url.protocol}//${url.host}`;
    }

    return FE_HOST;
  },
  getResource: async ctx => {
    const businessUnit = await BusinessUnitRepository.getInstance(ctx.state, {
      schemaName: ctx.params.tenantName,
    }).getBy({
      condition: { id: ctx.params.businessUnit },
    });

    return `srn:${ctx.params.tenantName}:${
      businessUnit.type === BUSINESS_UNIT_TYPE.recyclingFacility ? 'recycling' : 'hauling'
    }:${ctx.params.businessUnit}`;
  },
  getResourceUrlPart: ctx => `/${ctx.params.tenantName}/business-units/${ctx.params.businessUnit}`,
  redirectToLogin: (ctx, queryParams) => {
    ctx.redirect(`${FE_HOST}/lobby?${querystring.stringify(queryParams)}`);
  },
});

router.post('/accesstoken', validate(getTokenParams), getAccessToken);

router.use('/lobby', lobbyAuthRouter.allowedMethods(), lobbyAuthRouter.routes());

router.use(
  '/:tenantName/configuration',
  configurationAuthRouter.allowedMethods(),
  configurationAuthRouter.routes(),
);
router.use(
  '/:tenantName/business-units/:businessUnit',
  businessUnitAuthRouter.allowedMethods(),
  businessUnitAuthRouter.routes(),
);

router.get('/me', authorized(), ctx => {
  ctx.body = ctx.state.user;
  ctx.status = 200;
});

export default router.routes();
