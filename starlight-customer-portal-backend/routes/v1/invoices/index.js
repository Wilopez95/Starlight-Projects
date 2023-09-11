import Router from '@koa/router';

import ACTIONS from '../../../consts/actions.js';
import validate from '../../../middlewares/validate.js';
import { authorizedMiddleware as authorized } from '../../../auth/authorized.js';

import { combinedInvoice } from './schema.js';
import { downloadCombinedInvoices } from './controller.js';

const {
  invoices: { list },
} = ACTIONS;
const router = new Router();

router.get(
  '/combined',
  authorized([list]),
  validate(combinedInvoice, 'query'),
  downloadCombinedInvoices,
);

export default router.routes();
