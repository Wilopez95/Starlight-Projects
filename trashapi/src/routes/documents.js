import { Router } from 'express';

import documentView from '../views/documents.js';
import Documents from '../models/documents.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';
import universal from './universal.js';

const { dispatcher, configuration, driver } = ACTIONS;
const routes = universal.router(Documents);
const router = new Router();

router.param('id', routes.param('document'));

router
  .route('/:id?')
  .get(
    authorized([dispatcher.access, configuration.access]),
    ...routes.read(documentView, 'document'),
  )
  .post(authorized([dispatcher.access, driver.access]), ...routes.create(documentView))
  .delete(authorized([dispatcher.access]), ...routes.remove('document'));

export default router;
