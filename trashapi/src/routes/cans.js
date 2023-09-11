import R from 'ramda';
import csv from 'csv';
import { format } from 'date-fns';
import { Router } from 'express';
import groupBy from 'lodash/groupBy.js';

import canLocationView from '../views/can-location.js';
import cansTransactionsView from '../views/cans-transactions.js';
import { my } from '../utils/query.js';
import { promisify } from '../utils/functions.js';
import asyncWrap from '../utils/asyncWrap.js';
import { notFoundError } from '../utils/errors.js';
import { csvDateFrmt } from '../utils/format.js';
import { bodyType } from '../middlewares/validation.js';
import Cans, { findAll, findById, note } from '../models/cans.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import { getHaulingTruckById, getHaulingTrucks } from '../services/hauling/trucks.js';
import ACTIONS from '../consts/actions.js';
import universal from './universal.js';
import importer, { csvHeader } from './cans/importer.js';

const { dispatcher, driver } = ACTIONS;
const router = new Router();

const routes = universal.router(Cans);

const exporter = asyncWrap(async (req, res) => {
  const items = R.map(
    canLocationView,
    await my(
      findAll({
        ...req.query,
        withTransactions: '0',
        businessUnitId: req.user.businessUnitId,
      }),
      req.user,
    ),
  );
  res.set('Content-Type', 'application/octet-stream');
  res.send(
    await promisify(cb =>
      csv.stringify(
        R.prepend(
          csvHeader,
          R.map(
            item => [
              item.id,
              item.serial,
              item.size,
              item.name,
              format(item.startDate, csvDateFrmt),
              item.source,
              R.any(el => !el, [item.location.id, item.location.type])
                ? ''
                : item?.location?.name.replace(/#/g, 'no. '),
            ],
            items,
          ),
        ),
        cb,
      ),
    ),
  );
});

router.use('/import', authorized([dispatcher.access]), importer);

router.get('/export', authorized([dispatcher.access]), exporter);

router.param('canId', routes.param('can'));

router.post(
  '/:canId/note',
  authorized([dispatcher.access]),
  bodyType('Object'),
  universal.route(
    204,
    async req =>
      await my(async query => {
        const can = await findById(req.can.id, query);
        if (!can || R.isEmpty(can)) {
          throw notFoundError;
        }
        await note(can.id, req.body, req.user, query);
      }, req.user),
  ),
);

router.put(
  '/:canId/:action',
  authorized([dispatcher.access]),
  asyncWrap(async (req, res) => {
    const {
      body: { location, truckId },
      params,
    } = req;
    const action = R.toUpper(params.action);
    await my(async query => {
      const can = await findById(req.can.id, query);
      if (!can || R.isEmpty(can)) {
        return res.status(404).send(notFoundError);
      }
      if (truckId !== undefined) {
        can.truckId = truckId;
      }
      await Cans[action](can, location, req.user, query);
      return res.status(204).send();
    }, req.user);
  }),
);

const oneCanTransactions = R.compose(R.head, cansTransactionsView);

const getCans = asyncWrap(async (req, res) => {
  const allCans = await my(async query => {
    // this is /cans/:id
    if (req.can) {
      const filteredCans = await findAll(req.can, query);
      if (!filteredCans || R.isEmpty(filteredCans)) {
        throw notFoundError;
      }
      const can = oneCanTransactions(filteredCans);
      const truck = await getHaulingTruckById(req, can.truckId);
      can.truck = truck ?? {};
      return can;
    }
    // this is /cans
    let cans = await findAll(req.query, query);
    const truckIds = [...new Set(cans.map(({ truckId }) => truckId).filter(Boolean))];
    if (truckIds?.length) {
      const trucks = (await getHaulingTrucks(req, { truckIds })) ?? [];
      const trucksById = groupBy(trucks, 'id');
      cans = R.map(item => {
        const truck = trucksById?.[item.truckId]?.[0] ?? {};
        item.truck = truck;
        return item;
      }, cans);
    }

    return req.query.withTransactions === '0'
      ? R.map(canLocationView, cans)
      : cansTransactionsView(cans);
  }, req.user);
  // Sometimes we dont want the truck object if it is null and empty. PArticularly for the inventory board
  // rather than create another "view" we'll filter the results if the queyr exists.
  // Steven 9/27/22
  if (req.query?.withTruckIds === '1') {
    return res.status(200).json(allCans.filter(can => can.truckId !== null));
  }
  return res.status(200).json(allCans);
});

router
  .route('/:canId?')
  .get(authorized([dispatcher.access, driver.access]), getCans)
  .post(authorized([dispatcher.access]), ...routes.create(oneCanTransactions))
  .put(authorized([dispatcher.access]), ...routes.update(oneCanTransactions, 'can'))
  .delete(authorized([dispatcher.access]), ...routes.remove('can'));

export default router;
