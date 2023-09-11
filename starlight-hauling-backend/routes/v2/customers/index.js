import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { processSearchQuery } from '../../../middlewares/requestParamsParser.js';
import { authorized } from '../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import {
  customerData,
  customerParams,
  countParams,
  searchParams,
  editCustomerData,
  searchCustomersDuplicateData,
  groupsData,
  changeStatusData,
} from './schema.js';

import {
  getCustomers,
  getCustomersCount,
  getCustomerById,
  getCustomersForInvoicing,
  getGroupsByCustomerIds,
  searchCustomers,
  createCustomer,
  editCustomer,
  deleteCustomer,
  searchCustomersDuplicate,
  getCustomersForInvoicingWithSubscriptions,
  changeCustomerStatus,
} from './controller.js';
import profileRoutes from './profile/index.js';

const router = new Router();

router.get('/invoicing', getCustomersForInvoicing);
router.get('/invoicing-subscriptions', getCustomersForInvoicingWithSubscriptions);

router.get('/invoicing', authorized([PERMISSIONS.customersView]), getCustomersForInvoicing);
router.get(
  '/search',
  authorized([PERMISSIONS.customersView]),
  processSearchQuery.bind(null, 'name', true),
  validate(searchParams, 'query'),
  searchCustomers,
);
router.use('/:customerId/profile', authorized([PERMISSIONS.customersView]), profileRoutes);

router.get(
  '/count',
  authorized([PERMISSIONS.customersView]),
  processSearchQuery.bind(null, 'query', false),
  validate(countParams, 'query'),
  getCustomersCount,
);
router.get(
  '/',
  authorized([PERMISSIONS.customersView]),
  processSearchQuery.bind(null, 'query', false),
  validate(customerParams, 'query'),
  getCustomers,
);

router.get('/:id', authorized([PERMISSIONS.customersView]), getCustomerById);
router.post('/', authorized([PERMISSIONS.customersCreate]), validate(customerData), createCustomer);
router.post(
  '/search/customer-duplicates',
  authorized([PERMISSIONS.customersView]),
  validate(searchCustomersDuplicateData),
  searchCustomersDuplicate,
);
router.post(
  '/groups',
  authorized([PERMISSIONS.customersView]),
  validate(groupsData),
  getGroupsByCustomerIds,
);
router.patch(
  '/:id/status',
  authorized([PERMISSIONS.customersHold]),
  validate(changeStatusData),
  changeCustomerStatus,
);
router.put(
  '/:id',
  authorized([PERMISSIONS.customersEdit]),
  validate(editCustomerData),
  editCustomer,
);

// TODO: add separate permission for deleting customers?
router.delete('/:id', authorized([PERMISSIONS.customersCreate]), deleteCustomer);

export default router.routes();
