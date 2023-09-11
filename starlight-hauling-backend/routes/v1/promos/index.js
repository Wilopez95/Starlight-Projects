import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import { promoData, queryParams } from './schema.js';
import { getPromoById, getPromos, createPromo, editPromo, deletePromo } from './controller.js';

const router = new Router();

router.get(
  '/',
  authorized([PERMISSIONS.configurationPromosList]),
  validate(queryParams, 'query'),
  getPromos,
);
router.get('/:id', authorized([PERMISSIONS.configurationPromosView]), getPromoById);
router.post(
  '/',
  authorized([PERMISSIONS.configurationPromosCreate]),
  validate(promoData),
  createPromo,
);
router.put(
  '/:id',
  authorized([PERMISSIONS.configurationPromosUpdate]),
  validate(promoData),
  editPromo,
);
router.delete('/:id', authorized([PERMISSIONS.configurationPromosDelete]), deletePromo);

export default router.routes();
