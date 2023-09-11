import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { processSearchQuery } from '../../../middlewares/requestParamsParser.js';
import { authorized } from '../../../middlewares/authorized.js';
import { skipBodyLogging } from '../../../middlewares/logger.js';

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
  bulkOnHoldData,
  bulkResumeData,
  termsAndConditionsParams,
} from './schema.js';

import {
  getCustomers,
  getCustomersCount,
  getCustomerById,
  getCustomersForInvoicing,
  getGroupsByCustomerIds,
  getCustomerByGroupAndType,
  searchCustomers,
  createCustomer,
  editCustomer,
  deleteCustomer,
  searchCustomersDuplicate,
  getCustomersForInvoicingWithSubscriptions,
  changeCustomerStatus,
  bulkPutOnHold,
  bulkResume,
  resendTerms,
  getCustomersByIds,
  getAllCustomersQB,
} from './controller.js';

import profileRoutes from './profile/index.js';
import linkedJobSitesRoutes from './jobSites/index.js';
import taxExemptionsRoutes from './taxExemptions/index.js';
import mediaRoutes from './media/index.js';
import importRoutes from './import/index.js';

const router = new Router();

router.get('/resendTerms', validate(termsAndConditionsParams, 'query'), resendTerms);
router.use('/media', mediaRoutes);
router.use('/import', importRoutes);

router.get('/qb', skipBodyLogging, getAllCustomersQB);
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
router.use('/:customerId/job-sites', authorized([PERMISSIONS.customersView]), linkedJobSitesRoutes);
router.use(
  '/:customerId/tax-exemptions',
  authorized([PERMISSIONS.customersView]),
  taxExemptionsRoutes,
);

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

router.post(
  '/getByIds',
  authorized([PERMISSIONS.customersView]),
  // validate(customerParams, 'query'),
  getCustomersByIds,
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

router.post('/groups-type', authorized([PERMISSIONS.customersView]), getCustomerByGroupAndType);

router.patch(
  '/bulk-on-hold',
  authorized([PERMISSIONS.customersHold]),
  validate(bulkOnHoldData),
  bulkPutOnHold,
);
router.patch(
  '/bulk-resume',
  authorized([PERMISSIONS.customersHold]),
  validate(bulkResumeData),
  bulkResume,
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
