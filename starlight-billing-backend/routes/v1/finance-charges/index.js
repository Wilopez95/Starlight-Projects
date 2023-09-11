import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { financeChargeDownloadSchema } from './schema.js';
import { download } from './controller.js';

const router = new Router();

router.get('/download', validate(financeChargeDownloadSchema, 'query'), download);

export default router.routes();
