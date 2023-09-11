import Router from '@koa/router';

import ACTIONS from '../../../consts/actions.js';
import validate from '../../../middlewares/validate.js';
import checkCustomerId from '../../../middlewares/checkCustomerId.js';
import { authorizedMiddleware as authorized } from '../../../auth/authorized.js';
import idType from '../../../consts/idType.js';

import { getCustomerById, editCustomer } from './controller.js';
import { customerData } from './schema.js';

const {
  profile: { view, update },
} = ACTIONS;
const router = new Router();

router.get(
  '/:id',
  authorized([view]),
  checkCustomerId,
  validate(idType, 'params'),
  getCustomerById,
);
router.put(
  '/:id',
  authorized([update]),
  checkCustomerId,
  validate(idType, 'params'),
  validate(customerData),
  editCustomer,
);

export default router.routes();
