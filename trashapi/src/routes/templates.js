import R from 'ramda';
import { Router } from 'express';
import fetch from 'node-fetch';

import templatesView from '../views/templates.js';
import { notFoundError } from '../utils/errors.js';
import Templates, { findById } from '../models/templates.js';
import { my } from '../utils/query.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';
import universal from './universal.js';

const { dispatcher, configuration } = ACTIONS;
const routes = universal.router(Templates);
const router = new Router();

router.param('id', routes.param('template'));

router
  .route('/:id?')
  .get(
    authorized([dispatcher.access, configuration.access]),
    ...routes.read(templatesView, 'template'),
  )
  .post(authorized([configuration.access]), ...routes.create(templatesView))
  .put(authorized([configuration.access]), ...routes.update(templatesView, 'template'))
  .delete(authorized([configuration.access]), ...routes.remove('template'));

async function getTemplatePreview(req, res, next) {
  try {
    const {
      params: { id },
    } = req;
    const tpl = await my(findById({ id }), req.user);
    if (!tpl) {
      return next(notFoundError);
    }

    return res
      .status(200)
      .set('Content-Type', 'application/pdf')
      .send(
        fetch(tpl.url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/pdf' },
        }),
      );
  } catch (err) {
    err.code = R.is(Number, err.code) ? err.code : 500;
    return next(err);
  }
}
router
  .route('/:id/preview')
  .get(authorized([dispatcher.access, configuration.access]), getTemplatePreview);

export default router;
