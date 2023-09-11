import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import {
  createChangeReasonSchema,
  updateChangeReasonSchema,
  getChangeReasonsSchema,
} from './schema.js';

import { getChangeReasons, createChangeReason, updateChangeReason } from './controller.js';

const router = new Router();

router.get('/', validate(getChangeReasonsSchema, 'query'), getChangeReasons);
router.post('/', validate(createChangeReasonSchema), createChangeReason);
router.put('/:id', validate(updateChangeReasonSchema), updateChangeReason);

export default router.routes();
