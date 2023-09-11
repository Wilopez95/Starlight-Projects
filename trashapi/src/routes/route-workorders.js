import { Router } from 'express';
import HttpStatus from 'http-status';

import asyncWrap from '../utils/asyncWrap.js';
import {
  updateWorkOrderAndFetch,
  fetchWorkOrderNotes,
  fetchWorkOrderNotesCount,
} from '../services/routePlanner/api.js';

const router = new Router();

// TODO: probably check to verify driver updates only his own work orders is needed here
const updateWorkOrder = asyncWrap(async (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  const result = await updateWorkOrderAndFetch(req, {
    id,
    body,
  });

  return res.status(HttpStatus.OK).json(result ?? {});
});

const getWorkOrderNotes = asyncWrap(async (req, res) => {
  const {
    params: { id },
  } = req;

  const result = await fetchWorkOrderNotes(req, {
    id,
  });

  return res.status(HttpStatus.OK).json(result ?? {});
});

const getWorkOrderNotesCount = asyncWrap(async (req, res) => {
  const {
    params: { id },
  } = req;

  const result = await fetchWorkOrderNotesCount(req, {
    id,
  });

  return res.status(HttpStatus.OK).json(result ?? {});
});

router.put('/:id', updateWorkOrder);
router.get('/:id/notes/count', getWorkOrderNotesCount);
router.get('/:id/notes', getWorkOrderNotes);

export default router;
