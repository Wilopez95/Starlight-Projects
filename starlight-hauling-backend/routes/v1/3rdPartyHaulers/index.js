import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';

import { authorized } from '../../../middlewares/authorized.js';
import { PERMISSIONS } from '../../../consts/permissions.js';
import {
  thirdPartyHaulerData,
  activeOnly,
  operatingCostsQuery,
  operatingCostsData,
} from './schema.js';
import {
  get3rdPartyHaulerById,
  get3rdPartyHaulers,
  create3rdPartyHauler,
  edit3rdPartyHauler,
  delete3rdPartyHauler,
  getOperatingCosts,
  updateOperatingCosts,
} from './controller.js';

const router = new Router();

router.get(
  '/',
  authorized([PERMISSIONS.configurationThirdPartyHaulersList]),
  validate(activeOnly, 'query'),
  get3rdPartyHaulers,
);
router.get('/:id', authorized(['configuration:third-party-haulers:view']), get3rdPartyHaulerById);
router.post(
  '/',
  authorized(['configuration:third-party-haulers:create']),
  validate(thirdPartyHaulerData),
  create3rdPartyHauler,
);
router.put(
  '/:id',
  authorized(['configuration:third-party-haulers:update']),
  validate(thirdPartyHaulerData),
  edit3rdPartyHauler,
);
router.delete(
  '/:id',
  authorized(['configuration:third-party-haulers:delete']),
  delete3rdPartyHauler,
);
router.get(
  '/:id/operating-costs',
  authorized(['configuration:operating-costs:list']),
  validate(operatingCostsQuery, 'query'),
  getOperatingCosts,
);
router.patch(
  '/:id/operating-costs',
  authorized(['configuration:operating-costs:update']),
  validate(operatingCostsData),
  updateOperatingCosts,
);

export default router.routes();
