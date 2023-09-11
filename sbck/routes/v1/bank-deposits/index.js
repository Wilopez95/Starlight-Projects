import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { bankDepositDownloadSchema } from './schema.js';
import { download } from './controller.js';

const router = new Router();

router.get('/download', validate(bankDepositDownloadSchema, 'query'), download);

export default router.routes();
