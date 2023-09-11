import Router from '@koa/router';
import validate from '../../../middlewares/validate.js';
import { queryParams, orderIdsParams } from './schema.js';

import { getQBServicesList, insertManyQBServices } from './controller.js';

const router = new Router();

router.get('/', validate(queryParams, 'query'), getQBServicesList);
router.post('/:id', validate(queryParams, 'query'), validate(orderIdsParams), insertManyQBServices);

export default router.routes();
