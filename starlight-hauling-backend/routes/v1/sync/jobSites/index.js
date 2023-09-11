import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { syncJobSitesParams } from './schema.js';

import { syncJobSites } from './controller.js';

const router = new Router();

router.post('/', validate(syncJobSitesParams), syncJobSites);

export default router.routes();
