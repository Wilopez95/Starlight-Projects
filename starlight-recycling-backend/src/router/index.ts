import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import json from 'koa-json';
import Axios from 'axios';

import { createHealthCheck } from '../middleware/healthCheck';

import { STATIC_BUCKET, STATIC_BUCKET_REGION, FRONTEND_URL, CORE_FRONTEND_HOST } from '../config';
import buildGraphqlRouter from './graphqlRouter';
import { router as bullBoardRouter } from './bull-board';
import { buildAuthRouter } from '../modules/auth';
import { entities } from '../modules/recycling';
import tenantMiddleware from '../middleware/tentantMiddleware';
import { Context, AppState } from '../types/Context';
import { userMiddleware } from '../middleware/userMiddleware';
import { withServiceTokenMiddleware } from '../utils/serviceToken';
import { QueryContext } from 'src/types/QueryContext';

const virginia = 'us-east-1';

export const buildRouter = async (): Promise<Router<AppState, Context>> => {
  const rootRouter = new Router<AppState, Context>();

  rootRouter.use(json());
  rootRouter.use('/health-check', createHealthCheck());

  const recyclingAuthRouter = await buildAuthRouter({
    frontendUrl: FRONTEND_URL,
    coreFrontendUrl: CORE_FRONTEND_HOST,
    getResource: (ctx) => `srn:${ctx.params['tenantName']}:recycling:${ctx.params['buId']}`,
    getResourceUrlPart: (ctx) => `${ctx.params['tenantName']}/recycling/${ctx.params['buId']}`,
  });

  rootRouter.use(
    '/api/:tenantName/recycling/:buId',
    recyclingAuthRouter.routes(),
    recyclingAuthRouter.allowedMethods(),
  );

  const graphqlRouter = await buildGraphqlRouter();

  rootRouter.use(
    '/api/graphql',
    userMiddleware(),
    withServiceTokenMiddleware(),
    tenantMiddleware({ entities: Object.values(entities) }),
    graphqlRouter.routes(),
    graphqlRouter.allowedMethods(),
  );

  rootRouter.use(
    '/bull-board',
    // TODO require permissions
    userMiddleware({ requireUserToken: true }),
    bullBoardRouter.routes(),
    bullBoardRouter.allowedMethods(),
  );

  rootRouter.get('/400', async (ctx) => {
    ctx.status = 400;
    ctx.body = {
      msg: '400',
    };
  });

  rootRouter.post('/400', bodyParser(), async (ctx) => {
    ctx.status = 400;
    ctx.set('cache-control', 'no-store');
    ctx.body = {
      msg: '400',
      data: ctx.request.body,
    };
  });

  rootRouter.get('/500', async (ctx) => {
    ctx.throw(500);
  });

  const indexHtmlFetchMiddleware = async (ctx: QueryContext, resourceType: string) => {
    // resolve index.html
    try {
      const headers: { [key: string]: string } = {};

      if (ctx.headers['if-none-match']) {
        headers['if-none-match'] = ctx.headers['if-none-match'];
      }

      const region = STATIC_BUCKET_REGION === virginia ? '' : `-${STATIC_BUCKET_REGION}`;
      const indexHtml = `https://${STATIC_BUCKET}.s3${region}.amazonaws.com/static/${resourceType}/index.html`;

      ctx.log.info(`Looking for index.html at ${indexHtml}`);

      const response = await Axios.get(indexHtml, { headers });

      ctx.body = response.data;

      const keys = [
        'cache-control',
        'content-disposition',
        'content-encoding',
        'content-language',
        'content-length',
        'content-type',
        'etag',
      ];
      for (const key of keys) {
        if (response.headers[key]) {
          ctx.response.set(key, response.headers[key]);
        }
      }

      if (ctx.fresh) {
        ctx.status = 304;
      }
    } catch (e) {
      switch (e.response?.status) {
        case 304: {
          const keys = ['etag', 'last-modified', 'server', 'x-amz-id-2', 'x-amz-request-id'];

          for (const key of keys) {
            if (e.response.headers[key]) {
              ctx.response.set(key, e.response.headers[key]);
            }
          }

          ctx.status = 304;
          ctx.body = e.response.data;

          return;
        }

        case 404:
          ctx.status = 404;

          return;

        default:
          ctx.throw(e);
      }
    }
  };

  rootRouter.get('/qr', (ctx) => indexHtmlFetchMiddleware(ctx, 'recycling'));

  rootRouter.get('/:tenant/:resourceType/:id/(.*)', (ctx) =>
    indexHtmlFetchMiddleware(ctx, ctx.params['resourceType']),
  );

  rootRouter.get('*', async (ctx) => {
    //TODO: Add logger here
    ctx.log.info('missed all routes');
    //TODO: Define handler in case there is no such route in the system
    //TODO: Handle SPA routing here
    ctx.response.redirect(`${CORE_FRONTEND_HOST}/lobby`);
  });

  return rootRouter;
};

export default buildRouter;
