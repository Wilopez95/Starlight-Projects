import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { subscriptions } from './schema.js';

import { getMediaFilesForInvoice } from './controller.js';

const router = new Router();

router.post('/', validate(subscriptions), getMediaFilesForInvoice);

export default router.routes();
