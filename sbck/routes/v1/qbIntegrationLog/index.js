import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { paginationParams, integrationLogParams } from './schema.js';
import { filterIntegrationLog } from './controller.js';

const router = new Router();

router.post(
  '/',
  validate(paginationParams, 'query'),
  validate(integrationLogParams, 'body'),
  filterIntegrationLog,
);

export default router.routes();
