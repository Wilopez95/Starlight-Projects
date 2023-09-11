import { Router } from 'express';

import materialView from '../views/material.js';
import Materials from '../models/materials.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';
import universal from './universal.js';

const { dispatcher, configuration } = ACTIONS;
const routes = universal.router(Materials);
const router = new Router();

router.param('id', routes.param('material'));

router
  .route('/:id?')
  .get(
    authorized([dispatcher.access, configuration.access]),
    ...routes.read(materialView, 'material'),
  )
  .post(authorized([configuration.access]), ...routes.create(materialView))
  .put(authorized([configuration.access]), ...routes.update(materialView, 'material'))
  .delete(authorized([configuration.access]), ...routes.remove('material'));

export default router;
