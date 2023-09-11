import Router from '@koa/router';

import { castQueryParams } from '../../middlewares/requestParamsParser.js';
import { authorized } from '../../middlewares/authorized.js';

import customersRoutes from './customers/index.js';
import paymentsRoutes from './payments/index.js';
import invoicesRoutes from './invoices/index.js';
import batchStatementsRoutes from './batch-statements/index.js';
import statementsRoutes from './statements/index.js';
import settlementsRoutes from './settlements/index.js';
import financeChargesRoutes from './finance-charges/index.js';
import reportsRoutes from './reports/index.js';
import webhooksRoutes from './webhooks/index.js';
import schedulerRoutes from './schedulers/index.js';
import bankDepositRoutes from './bank-deposits/index.js';

import qbIntegrationAccounts from './qbIntegrationAccount/index.js';
import qbIntegrationSettings from './qbIntegrationSettings/index.js';
import qbIntegrationLog from './qbIntegrationLog/index.js';
import qbIntegrationServices from './qbIntegrationService/index.js';

const router = new Router();

router.use(castQueryParams);

router.use('/customers/:customerId', authorized(), customersRoutes);
router.use('/payments', authorized(), paymentsRoutes);
router.use('/invoices', authorized(), invoicesRoutes);
router.use('/finance-charges', authorized(), financeChargesRoutes);
router.use('/reports', authorized(), reportsRoutes);
router.use('/statements', authorized(), statementsRoutes);
router.use('/batch-statements', authorized(), batchStatementsRoutes);
router.use('/settlements', authorized(), settlementsRoutes);
router.use('/bank-deposits', authorized(), bankDepositRoutes);
router.use('/webhooks', webhooksRoutes);

router.use(
  '/qb-configuration',
  authorized(['configuration:quick-books:perform']),
  qbIntegrationSettings,
);
router.use(
  '/qb-services',
  authorized(['configuration:quick-books:perform']),
  qbIntegrationServices,
);
router.use('/qb-integrations', authorized(['configuration:quick-books:perform']), qbIntegrationSettings);
router.use('/qb-integration-log', authorized(['configuration:quick-books:perform']), qbIntegrationLog);
router.use('/qb-accounts', authorized(['configuration:quick-books:perform']), qbIntegrationAccounts);
router.use('/qb-billable-items', authorized(['configuration:quick-books:perform']), qbIntegrationServices)

router.use('/schedulers', schedulerRoutes);

export default router.routes();
