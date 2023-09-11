import Router from '@koa/router';

import { authorized } from '../../../middlewares/authorized.js';
import validate from '../../../middlewares/validate.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import { destinationSchema, getPaginatedParams, getAllParams } from './schema.js';
import {
  createDestination,
  getDestinationsById,
  getDestinations,
  editDestination,
  getAllDestinations,
} from './controller.js';

const router = new Router();

router.get(
  '/',
  authorized([PERMISSIONS.recyclingDestinationList]),
  validate(getPaginatedParams, 'query'),
  getDestinations,
);

router.get(
  '/all',
  authorized([PERMISSIONS.recyclingDestinationList]),
  validate(getAllParams, 'query'),
  getAllDestinations,
);

router.get('/:id', authorized([PERMISSIONS.recyclingDestinationView]), getDestinationsById);

router.post(
  '/',
  authorized([PERMISSIONS.recyclingDestinationCreate]),
  validate(destinationSchema),
  createDestination,
);

router.put(
  '/:id',
  authorized([PERMISSIONS.recyclingDestinationUpdate]),
  validate(destinationSchema),
  editDestination,
);

export default router.routes();
