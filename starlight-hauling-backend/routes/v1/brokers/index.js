import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import { brokerData, activeOnly } from './schema.js';
import { getBrokerById, getBrokers, addBroker, editBroker, deleteBroker } from './controller.js';

const router = new Router();

router.get(
  '/',
  authorized([PERMISSIONS.configurationBrokersList]),
  validate(activeOnly, 'query'),
  getBrokers,
);
router.get('/:id', authorized([PERMISSIONS.configurationBrokersView]), getBrokerById);
router.post(
  '/',
  authorized([PERMISSIONS.configurationBrokersCreate]),
  validate(brokerData),
  addBroker,
);
router.put(
  '/:id',
  authorized([PERMISSIONS.configurationBrokersUpdate]),
  validate(brokerData),
  editBroker,
);
router.delete('/:id', authorized([PERMISSIONS.configurationBrokersDelete]), deleteBroker);

export default router.routes();
