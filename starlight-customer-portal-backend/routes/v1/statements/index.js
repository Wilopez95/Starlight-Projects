import Router from '@koa/router';

import ACTIONS from '../../../consts/actions.js';
import validate from '../../../middlewares/validate.js';
import { authorizedMiddleware as authorized } from '../../../auth/authorized.js';

import { downloadStatementsSchema } from './schema.js';
import { downloadStatements } from './controller.js';

const {
  statements: { list },
} = ACTIONS;
const router = new Router();

router.get(
  '/download',
  authorized([list]),
  validate(downloadStatementsSchema, 'query'),
  downloadStatements,
);

export default router.routes();
