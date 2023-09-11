import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { index, optionalIndex } from './schema.js';
import { reSyncIndex, createIndex, deleteIndex } from './controller.js';

const router = new Router();

router.put('/resync', validate(optionalIndex), reSyncIndex);
router.post('/index', validate(index), createIndex);
router.delete('/index', validate(index), deleteIndex);

export default router.routes();
