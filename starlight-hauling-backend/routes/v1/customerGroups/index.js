import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';
import { skipBodyLogging } from '../../../middlewares/logger.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import { customerGroupData, customerGroupParams } from './schema.js';
import {
  getCustomerGroupById,
  getCustomerGroups,
  createCustomerGroup,
  editCustomerGroup,
  deleteCustomerGroup,
  getAllWithCustomersQBData,
} from './controller.js';

const router = new Router();

router.get(
  '/',
  authorized([PERMISSIONS.configurationCustomerGroupsList]),
  validate(customerGroupParams, 'query'),
  getCustomerGroups,
);
router.get('/qb', skipBodyLogging, getAllWithCustomersQBData);
router.get('/:id', authorized([PERMISSIONS.configurationCustomerGroupsView]), getCustomerGroupById);
router.post(
  '/',
  authorized([PERMISSIONS.configurationCustomerGroupsCreate]),
  validate(customerGroupData),
  createCustomerGroup,
);
router.put(
  '/:id',
  authorized([PERMISSIONS.configurationCustomerGroupsUpdate]),
  validate(customerGroupData),
  editCustomerGroup,
);
router.delete(
  '/:id',
  authorized([PERMISSIONS.configurationCustomerGroupsDelete]),
  deleteCustomerGroup,
);

export default router.routes();
