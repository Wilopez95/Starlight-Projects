import Router from '@koa/router';

import { API_ROOT } from '../config';
import { AppState, Context } from '../context';

import { createHealthCheck } from '../middleware/healthCheck';
import { userInfoMiddleware } from '../middleware/userInfo';
import { serviceTokenMiddleware } from '../middleware/serviceToken';
import buildGraphqlRouter from './graphqlRouter';

import authRouter from './auth';

export const buildRouter = (): Router<AppState, Context> => {
  const rootRouter = new Router<AppState, Context>();
  const apiRouter = new Router<AppState, Context>({
    prefix: API_ROOT,
  });
  const graphqlRouter = buildGraphqlRouter();

  apiRouter.use('/auth', authRouter.routes(), authRouter.allowedMethods());

  apiRouter.use(
    '/graphql',
    userInfoMiddleware,
    serviceTokenMiddleware,
    graphqlRouter.routes(),
    graphqlRouter.allowedMethods(),
  );

  rootRouter.all('/health-check', createHealthCheck());
  rootRouter.use(apiRouter.routes(), apiRouter.allowedMethods());

  return rootRouter;
};

export default buildRouter;
