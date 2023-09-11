import { Router } from 'express';

import sizeView from '../views/size.js';
import Sizes from '../models/sizes.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';
import universal from './universal.js';

const { dispatcher, configuration } = ACTIONS;
const routes = universal.router(Sizes);
const router = new Router();

router.param('id', routes.param('size'));

router
  .route('/:id?')
  .get(authorized([dispatcher.access, configuration.access]), ...routes.read(sizeView, 'size'))
  .post(authorized([configuration.access]), ...routes.create(sizeView))
  .put(authorized([configuration.access]), ...routes.update(sizeView, 'size'))
  .delete(authorized([configuration.access]), ...routes.remove('size'));

export default router;
