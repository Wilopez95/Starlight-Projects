import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { schemaName } from './schema.js';
import { syncCustomers } from './controller.js';

const router = new Router();

router.put('/:schemaName', validate(schemaName, 'params'), syncCustomers);

export default router.routes();
