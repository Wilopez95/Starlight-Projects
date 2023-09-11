import express from 'express';

import { upload, base64Upload } from '../services/s3/index.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';
import asyncWrap from '../utils/asyncWrap.js';
import constants from './constants.js';
import docs from './docs.js';
import cans from './cans.js';
import documents from './documents.js';
import locations from './locations.js';
import workOrders from './workorders.js';
import drivers from './drivers.js';
import templates from './templates.js';
import trips from './trips.js';
import timeCards from './timecards.js';
import settings from './settings.js';
import reports from './reports.js';
import materials from './materials.js';
import sizes from './sizes.js';
import lobby from './lobby.js';
import auth from './auth.js';
import companies from './companies.js';
import businessUnits from './business-units.js';
import trucks from './trucks.js';
import dailyRoutes from './dailyRoutes.js';
import routeWorkOrders from './route-workorders.js';
import landfills from './landfills.js';

const { dispatcher, configuration } = ACTIONS;
// eslint-disable-next-line new-cap
const router = express.Router();

router.get(`/system/healthcheck`, (req, res) => {
  res.status(200);
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json({
    health: 'good',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
});

router.use('/docs', docs);

router.use('/v1/cans', authorized(), cans);
router.use('/v1/documents', authorized(), documents);
router.use('/v1/locations', authorized(), locations);
router.use('/v1/workorders', authorized(), workOrders);
router.use('/v1/drivers', authorized(), drivers);
router.use('/v1/templates', authorized(), templates);
router.use('/v1/trips', authorized(), trips);
router.use('/v1/timecards', authorized(), timeCards);
router.use('/v1/settings', authorized(), settings);
router.use('/v1/reports', authorized(), reports);
router.use('/v1/materials', authorized(), materials);
router.use('/v1/sizes', authorized(), sizes);
router.use('/v1/constants', authorized(), constants);
router.use('/v1/companies', authorized(), companies);
router.use('/v1/lobby', authorized(), lobby);
router.use('/v1/auth', auth);
router.use('/v1/business-units', authorized(), businessUnits);
router.use('/v1/trucks', authorized(), trucks);
router.use('/v1/daily-routes', authorized(), dailyRoutes);
router.use('/v1/route-workorders', authorized(), routeWorkOrders);
router.use('/v1/landfills', authorized(), landfills);

router.post(
  '/v1/upload',
  authorized([dispatcher.access, configuration.access]),
  upload.single('file'),
  asyncWrap(async (req, res) => res.json(req.file)),
);
router.post(
  '/v1/uploadBase64',
  authorized([dispatcher.access, configuration.access]),
  asyncWrap(async (req, res) => {
    const { base64Image } = req.body;

    const file = await base64Upload(base64Image);
    res.json({ file });
  }),
);

export default router;
