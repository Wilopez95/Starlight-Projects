import R from 'ramda';
import csv from 'csv';
import { format } from 'date-fns';
import { Router } from 'express';
import HTTPStatus from 'http-status';

import workOrderView from '../views/workorder.js';
import workOrderNoteView from '../views/wo-note.js';
import { conflict } from '../utils/errors.js';
import asyncWrap from '../utils/asyncWrap.js';
import { csvDateFrmt } from '../utils/format.js';
import { my } from '../utils/query.js';
import { promisify } from '../utils/functions.js';
import constants from '../utils/constants.js';
import WorkOrders, { findByDriverId, bulk, update } from '../models/workorders.js';
import { findAll as notesFindAll } from '../models/wo-notes.js';
import { findAll } from '../models/trucks-and-drivers.js';
import { getHaulingData, syncEditedOrderWithHauling } from '../services/hauling/sync.js';
import { bodyType } from '../middlewares/validation.js';
import { ValidationError } from '../services/error/index.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';
import { getDisposalSiteByDescription } from '../services/hauling/disposal-sites.js';
import { readWith } from './trucks-and-drivers.js';
import universal from './universal.js';
import importer, { csvHeader } from './workorders/importer.js';
import notes from './workorders/notes.js';
import transitions from './workorders/transitions.js';

const { dispatcher, driver } = ACTIONS;
const { workOrder: wo } = constants;
const {
  status: { UNASSIGNED },
} = wo;

const unassigned = ({ body: workOrder }, _, next) => {
  if (workOrder.status === UNASSIGNED && workOrder.driverId) {
    return next(
      conflict(
        `Can't create a work order that has a status of ${UNASSIGNED} but contains a driver id.`,
      ),
    );
  }
  return next();
};

const router = new Router();

const routes = universal.router(WorkOrders);

router.param('workOrderId', routes.param('workOrder'));

router.use('/import', authorized([dispatcher.access]), importer);

router.get(
  '/notes',
  authorized([dispatcher.access]),
  universal.route(HTTPStatus.OK, async req => {
    const { user, query } = req;
    const records = await my(notesFindAll(query), user);
    return records.map(workOrderNoteView);
  }),
);

router.get(
  '/export',
  authorized([dispatcher.access]),
  asyncWrap(async (req, res) => {
    req.query.businessUnitId = req.user.businessUnitId;
    const items = await findAll({
      req,
      model: WorkOrders,
      view: workOrderView,
    });

    const result = await promisify(cb =>
      csv.stringify(
        R.prepend(
          csvHeader,
          R.map(
            item => [
              item.id,
              item.action,
              item.status,
              item.size,
              item.material,
              format(item.scheduledDate, csvDateFrmt),
              item.scheduledStart,
              item.scheduledEnd,
              item.contactName,
              item.contactNumber,
              item.location1.name,
              item.location2.name,
              item.priority,
              item.step,
              item.permitNumber,
              item.customerName,
              item.driver.description,
            ],
            items,
          ),
        ),
        cb,
      ),
    );
    res.set('Content-Type', 'application/octet-stream');
    res.send(result);
  }),
);

router.get(
  '/driver/:driverId',
  authorized([dispatcher.access]),
  universal.route(HTTPStatus.OK, async ({ user, params }) =>
    R.map(workOrderView, await my(findByDriverId(params.driverId), user)),
  ),
);

router.use('/:workOrderId/note', authorized(), notes);

router.use('/:workOrderId/transition', authorized(), transitions);

router.put(
  '/',
  authorized([dispatcher.access, driver.access]),
  universal.route(HTTPStatus.ACCEPTED, async req =>
    R.map(R.unless(R.isNil, workOrderView), await my(bulk(req), req.user)),
  ),
);

const updateWorkOrder = asyncWrap(async (req, res) => {
  const { user, body, workOrder } = req;
  const { id } = workOrder;

  const { location2 } = body;

  const updated = {
    ...body,
  };

  if (location2 && location2.type === 'WAYPOINT') {
    const result = await getDisposalSiteByDescription(req, location2.description);
    if (result !== null) {
      updated.haulingDisposalSiteId = result.haulingDisposalSiteId;
    }
  }

  const data = workOrderView(await my(query => update(id, updated, user, query, req), user));

  const haulingResponse = await syncEditedOrderWithHauling({
    req,
    workOrder,
    workOrderSeed: updated,
  });
  if (haulingResponse) {
    data.haulingResponse = haulingResponse;
  }

  return res.status(HTTPStatus.ACCEPTED).send(data);
});

router
  .route('/:workOrderId?')
  .get(
    authorized([dispatcher.access, driver.access]),
    readWith({
      model: WorkOrders,
      view: workOrderView,
      instance: 'workOrder',
    }),
  )
  .post(authorized([dispatcher.access, driver.access]), ...routes.create(workOrderView, unassigned))
  .put(
    authorized([dispatcher.access, driver.access]),
    bodyType('Object'),
    unassigned,
    updateWorkOrder,
  )
  .delete(authorized([dispatcher.access, driver.access]), ...routes.remove('workOrder'));

const getHaulingRequestHandler = (type, ...middlewares) => [
  `/:workOrderId/${type}`,
  ...middlewares,
  universal.route(HTTPStatus.OK, async req => {
    const { workOrder, params, query } = req;
    const { workOrderId } = params;

    if (!workOrderId || isNaN(workOrderId)) {
      throw new ValidationError('Missing work order id', HTTPStatus.BAD_REQUEST);
    }

    return getHaulingData({ req, type, workOrder, query });
  }),
];

router.get(
  ...getHaulingRequestHandler('billable-services', authorized([dispatcher.access, driver.access])),
);
router.get(
  ...getHaulingRequestHandler('disposal-sites', authorized([dispatcher.access, driver.access])),
);
router.get(
  ...getHaulingRequestHandler('materials', authorized([dispatcher.access, driver.access])),
);

export default router;
