import R from 'ramda';
import { Router } from 'express';

import { my } from '../utils/query.js';
import constantsNoManifest from '../utils/constantsNoManifest.js';
import constants from '../utils/constants.js';
import { getMaterials, getSizes } from '../models/constants.js';
import { authorizedMiddleware as authorized } from '../auth/authorized.js';
import ACTIONS from '../consts/actions.js';

const { dispatcher, driver } = ACTIONS;
const router = new Router();

async function listConstants(req, res, next) {
  try {
    const constantsPayload = await my(async query => {
      let constantsToSend;
      if (req.user.enableManifest) {
        constantsToSend = R.clone(constants);
      } else {
        constantsToSend = R.clone(constantsNoManifest);
      }

      constantsToSend.workOrder.material = await getMaterials(query, {
        sort: 'name',
      });
      constantsToSend.can.size = await getSizes(query, {
        sort: 'name',
      });

      return constantsToSend;
    }, req.user);

    return res.status(200).json(constantsPayload);
  } catch (err) {
    err.code = R.is(Number, err.code) ? err.code : 500;
    return next(err);
  }
}
router.get('/', authorized([dispatcher.access, driver.access]), listConstants);

export default router;
