import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';
import { publishRecyclingOrderAuditLog } from './controller.js';
import { publishAuditLogValidation } from './schema.js';

const router = new Router();

router.post(
  '/recycling-order-publish',
  authorized(),
  validate(publishAuditLogValidation),
  publishRecyclingOrderAuditLog,
);

export default router.routes();
