import { Router } from 'express';
import HttpStatus from 'http-status';

import asyncWrap from '../utils/asyncWrap.js';
import { fetchLandfills } from '../services/routePlanner/api.js';

const router = new Router();

const getLandfills = asyncWrap(async (req, res) => {
  const result = await fetchLandfills(req);

  return res.status(HttpStatus.OK).json(result ?? {});
});

router.get('/', getLandfills);

export default router;
