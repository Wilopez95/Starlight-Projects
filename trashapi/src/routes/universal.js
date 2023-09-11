import R from 'ramda';
import { my } from '../utils/query.js';
import { bodyType, id as idValid } from '../middlewares/validation.js';
import asyncWrap from '../utils/asyncWrap.js';
import { notFoundError } from '../utils/errors.js';

export default {
  route: (status, fn) => asyncWrap(async (req, res) => res.status(status).send(await fn(req))),
  router: model => ({
    param: instance =>
      idValid(
        asyncWrap(async (req, res, next, id) => {
          req[instance] = await my(model.findById(id), req.user);
          if (!req[instance] || R.isEmpty(req[instance])) {
            return next(notFoundError);
          }
          return next();
        }),
      ),

    read: (view, instance, ...middlewares) => [
      ...middlewares,
      asyncWrap(async (req, res) => {
        // instance is the route, like driver, can, etc
        if (req[instance]) {
          return res.send(view(req[instance]));
        }
        const list = await my(model.findAll(req.query), req.user);
        return res.send(list?.length ? R.map(view, list) : []);
      }),
    ],

    create: (view, ...middlewares) => [
      bodyType('Object'),
      ...middlewares,
      asyncWrap(async (req, res) => {
        await my(
          async query =>
            res.status(202).send(await view(await model.create(req.body, req.user, query, req))),
          req.user,
        );
      }),
    ],

    update: (view, instance, ...middlewares) => [
      bodyType('Object'),
      ...middlewares,
      asyncWrap(async (req, res) => {
        await my(
          async query =>
            res
              .status(202)
              .send(
                await view(await model.update(req[instance].id, req.body, req.user, query, req)),
              ),
          req.user,
        );
      }),
    ],
    remove: (instance, ...middlewares) => [
      ...middlewares,
      asyncWrap(async (req, res) => {
        await my(async query => {
          req[instance] = await model.findById(req[instance].id, query);
          if (req[instance] && !R.isEmpty(req[instance])) {
            await model.remove(req[instance].id, req.user, query);
          }
          return res.status(204).send();
        }, req.user);
      }),
    ],
  }),
};
