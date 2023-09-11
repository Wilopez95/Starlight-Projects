import Router from '@koa/router';

import ACTIONS from '../../../consts/actions.js';
import validate from '../../../middlewares/validate.js';
import { authorizedMiddleware as authorized } from '../../../auth/authorized.js';

import { downloadSchema, sessionSchema } from './schema.js';
import { downloadReport, reportsList, reportsSession } from './controller.js';

const {
  reports: { perform },
} = ACTIONS;
const router = new Router();

router.get('/', authorized([perform]), reportsList);
router.get('/download', authorized([perform]), validate(downloadSchema, 'query'), downloadReport);
router.post('/session/view', authorized([perform]), validate(sessionSchema), reportsSession);

export default router.routes();
