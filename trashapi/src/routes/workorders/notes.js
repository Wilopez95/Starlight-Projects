import R from 'ramda';
import { Router } from 'express';
import { utcToZonedTime } from 'date-fns-tz';
import HttpStatus from 'http-status';

import workOrderNoteView from '../../views/wo-note.js';
import WorkOrderNotes, { create, update, remove } from '../../models/wo-notes.js';
import { findById } from '../../models/workorders.js';
import WorkOrdersTable from '../../tables/workorders.js';
import universal from '../universal.js';
import { invalidInputError, notFoundError } from '../../utils/errors.js';
import { my } from '../../utils/query.js';
import { syncOrderWithHauling } from '../../services/hauling/sync.js';
import { bodyType } from '../../middlewares/validation.js';
import asyncWrap from '../../utils/asyncWrap.js';
import { authorizedMiddleware as authorized } from '../../auth/authorized.js';
import ACTIONS from '../../consts/actions.js';

const { dispatcher, driver } = ACTIONS;
const router = new Router();
const routes = universal.router(WorkOrderNotes);

const assignWorkOrderId = async (req, res, next) => {
  const { user } = req;
  return await my(async query => {
    const workOrder = await findById(req.workOrder.id, query);
    if (!workOrder || R.isEmpty(workOrder)) {
      return next(notFoundError);
    }
    if (req.body.workOrderId && req.body.workOrderId !== req.workOrder.id) {
      return next(invalidInputError);
    }
    req.body.workOrderId = req.workOrder.id;
    req.query.workOrderId = req.workOrder.id;
    return next();
  }, user);
};

const createWorkOrderNote = asyncWrap(async (req, res) => {
  const { user, body, workOrder } = req;
  const { id: workOrderId } = workOrder;
  const updateBody = {
    modifiedDate: utcToZonedTime(new Date(), 'UTC'),
  };
  const whereBody = { id: workOrderId };
  const data = workOrderNoteView(await my(create(body, user), user));
  await my(WorkOrdersTable.update(updateBody).where(whereBody), user);

  const haulingResponse = await syncOrderWithHauling({ req, workOrder });
  if (haulingResponse) {
    data.haulingResponse = haulingResponse;
  }
  return res.status(HttpStatus.CREATED).send(data);
});

const updateWorkOrderNote = asyncWrap(async (req, res) => {
  const { user, body, workOrder, woNote } = req;
  const data = workOrderNoteView(await my(update(woNote.id, body, user), user));

  const haulingResponse = await syncOrderWithHauling({ req, workOrder });
  if (haulingResponse) {
    data.haulingResponse = haulingResponse;
  }
  return res.status(HttpStatus.ACCEPTED).send(data);
});

const removeWorkOrderNote = asyncWrap(async (req, res) => {
  const { user, workOrder, woNote } = req;
  await my(remove(woNote.id, user), user);
  const haulingResponse = await syncOrderWithHauling({ req, workOrder });

  const status = haulingResponse ? HttpStatus.ACCEPTED : HttpStatus.NO_CONTENT;
  const data = haulingResponse ? { haulingResponse } : null;
  return res.status(status).send(data);
});

router.param('workOrderNoteId', routes.param('woNote'));

router
  .route('/:workOrderNoteId?')
  .get(
    authorized([dispatcher.access, driver.access]),
    ...routes.read(workOrderNoteView, 'woNote', assignWorkOrderId),
  )
  .post(
    authorized([dispatcher.access, driver.access]),
    bodyType('Object'),
    assignWorkOrderId,
    createWorkOrderNote,
  )
  .put(
    authorized([dispatcher.access, driver.access]),
    bodyType('Object'),
    assignWorkOrderId,
    updateWorkOrderNote,
  )
  .delete(authorized([dispatcher.access, driver.access]), removeWorkOrderNote);

export default router;
