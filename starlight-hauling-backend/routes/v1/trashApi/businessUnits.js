import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';

import { authorized } from '../../../middlewares/authorized.js';
import { activeOnly } from '../businessUnits/schema.js';
import { getBusinessUnits } from '../businessUnits/controller.js';

const router = new Router();

router.get('/', authorized(), validate(activeOnly, 'query'), getBusinessUnits);

export default router.routes();
