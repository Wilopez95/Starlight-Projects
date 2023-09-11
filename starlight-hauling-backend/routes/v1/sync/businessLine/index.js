import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { syncLoBParams } from './schema.js';

import { syncLoB } from './controller.js';

const router = new Router();

router.get('/', validate(syncLoBParams, 'query'), syncLoB);

export default router.routes();
