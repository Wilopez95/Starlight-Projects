import Router from '@koa/router';

import { processSearchQuery } from '../../../middlewares/requestParamsParser.js';
import { authorized } from '../../../middlewares/authorized.js';
import validate from '../../../middlewares/validate.js';
import { addressSuggestionsParam } from '../schema.js';
import { searchAddressSuggestion } from '../controller.js';
import subscriptionsRoutes from './subscriptions/index.js';
import companiesRoutes from './companies/index.js';
import customersRoutes from './customers/index.js';
import contactsRoutes from './contacts/index.js';

const router = new Router();

router.use('/contacts', contactsRoutes);
router.use('/customers', customersRoutes);
router.use('/companies', companiesRoutes);
router.use('/subscriptions', subscriptionsRoutes);

router.get(
  '/address-suggestions',
  authorized(),
  processSearchQuery.bind(null, 'query', true),
  validate(addressSuggestionsParam, 'query'),
  searchAddressSuggestion,
);

export default router.routes();
