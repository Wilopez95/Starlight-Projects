import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { batchStatementDownloadSchema } from './schema.js';
import { download } from './controller.js';

const router = new Router();

router.get('/download', validate(batchStatementDownloadSchema, 'query'), download);

export default router.routes();
