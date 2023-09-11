import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { authorized } from '../../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../../consts/permissions.js';
import { customersRecords, customerData } from './schema.js';
import { getCustomers, getCustomersCount, getCustomerById, editCustomer } from './controller.js';

const router = new Router();

router.get('/', authorized(), validate(customersRecords, 'query'), getCustomers);
router.get('/count', authorized(), getCustomersCount);
router.get('/:id', authorized([PERMISSIONS.customerPortalProfileView]), getCustomerById);
router.put(
  '/:id',
  authorized([PERMISSIONS.customerPortalProfileUpdate]),
  validate(customerData),
  editCustomer,
);

export default router.routes();
