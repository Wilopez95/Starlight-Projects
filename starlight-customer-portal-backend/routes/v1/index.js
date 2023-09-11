import Router from '@koa/router';

import { castQueryParams } from '../../middlewares/requestParamsParser.js';
import checkPortalUser from '../../middlewares/checkPortalUser.js';
import { authorizedMiddleware } from '../../auth/authorized.js';

import contactsRoutes from './contacts/index.js';
import customersRoutes from './customers/index.js';
import authRoutes from './auth/index.js';
import companiesRoutes from './companies/index.js';
import lobbyRoutes from './lobby/index.js';
import subscriptionsRoutes from './subscriptions/index.js';
import statementsRoutes from './statements/index.js';
import invoicesRoutes from './invoices/index.js';
import reportsRoutes from './reports/index.js';

import { searchAddressSuggestion } from './search/controller.js';

const router = new Router();

router.use(castQueryParams);

router.use('/contacts', checkPortalUser, contactsRoutes);
router.use('/customers', checkPortalUser, customersRoutes);
router.use('/auth', authRoutes);
router.use('/companies', companiesRoutes);
router.use('/lobby', lobbyRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/statements', statementsRoutes);
router.use('/subscriptions', checkPortalUser, subscriptionsRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/reports', reportsRoutes);

router.get('/address-suggestions', authorizedMiddleware(), searchAddressSuggestion);

export default router.routes();
