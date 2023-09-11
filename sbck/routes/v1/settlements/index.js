import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { downloadSettlementsData } from './schema.js';
import { downloadSettlements } from './controller.js';

const router = new Router();

router.get('/download', validate(downloadSettlementsData, 'query'), downloadSettlements);

export default router.routes();
