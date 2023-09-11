import Router from '@koa/router';

import { authorized } from '../../../middlewares/authorized.js';

import validate from '../../../middlewares/validate.js';
import {
  createSchema,
  listSchema,
  deleteSchema,
  downloadSchema,
  downloadInvoiceSchema,
  downloadWeightTicketSchema,
  initDuplicateSchema,
  initSchema,
  materialsReportSchema,
  routeSheetReportSchema,
} from './schema.js';
import {
  download,
  downloadInvoice,
  downloadOneInvoice,
  downloadWeightTicket,
  initDeleteSession,
  initDuplicateSession,
  initSession,
  editSession,
  list,
  customerPortalList,
  readSessionData,
  getMaterialsReportUrl,
  getRouteSheetReportUrl,
} from './controller.js';

import { PORTAL_ACTIONS } from '../../../consts/customerPortal.js';

const { portalReports } = PORTAL_ACTIONS;
const router = new Router();

router.get(
  '/',
  authorized([
    'reports:accounting:view',
    'reports:accounting:update',
    'reports:operational:view',
    'reports:operational:update',
    'reports:sales:view',
    'reports:sales:update',
    'reports:profitability:view',
    'reports:profitability:update',
    'reports:custom:perform',
  ]),
  validate(listSchema, 'query'),
  readSessionData,
  list,
);
router.get('/customer-portal', authorized([portalReports.perform]), customerPortalList);
router.get(
  '/download',
  authorized([
    'reports:accounting:view',
    'reports:accounting:update',
    'reports:operational:view',
    'reports:operational:update',
    'reports:sales:view',
    'reports:sales:update',
    'reports:profitability:view',
    'reports:profitability:update',
    'reports:custom:perform',
    portalReports.perform,
  ]),
  validate(downloadSchema, 'query'),
  readSessionData,
  download,
);
router.get('/download-materials', validate(materialsReportSchema, 'query'), getMaterialsReportUrl);
router.get('/download-route-sheet', validate(routeSheetReportSchema, 'query'), readSessionData, getRouteSheetReportUrl);
router.get('/download-invoice', validate(downloadInvoiceSchema, 'query'), downloadInvoice);
router.get('/download-one-invoice', validate(downloadInvoiceSchema, 'query'), downloadOneInvoice);
router.get('/download-weight-ticket', validate(downloadWeightTicketSchema, 'query'), downloadWeightTicket);
router.post('/session/create', authorized(['reports:custom:perform']), validate(createSchema), readSessionData, initSession);
router.post('/session/delete', authorized(['reports:custom:perform']), validate(deleteSchema), readSessionData, initDeleteSession);
router.post(
  '/session/duplicate',
  authorized(['reports:custom:perform']),
  validate(initDuplicateSchema),
  readSessionData,
  initDuplicateSession,
);
router.post(
  '/session/edit',
  authorized([
    'reports:accounting:update',
    'reports:operational:update',
    'reports:sales:update',
    'reports:profitability:update',
    'reports:custom:perform',
  ]),
  validate(initSchema),
  readSessionData,
  editSession,
);
router.post(
  '/session/view',
  authorized([
    'reports:accounting:view',
    'reports:accounting:update',
    'reports:operational:view',
    'reports:operational:update',
    'reports:sales:view',
    'reports:sales:update',
    'reports:profitability:view',
    'reports:profitability:update',
    'reports:custom:perform',
    portalReports.perform,
  ]),
  validate(initSchema),
  readSessionData,
  initSession,
);

export default router.routes();
