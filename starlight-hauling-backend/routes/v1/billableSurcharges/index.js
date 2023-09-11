import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { skipBodyLogging } from '../../../middlewares/logger.js';

import { billableSurchargeData, qbSumParams, qbParams } from './schema.js';
import {
  getBillableSurchargeById,
  getBillableSurcharges,
  createBillableSurcharge,
  editBillableSurcharge,
  deleteBillableSurcharge,
  getSurchargesQBData,
  getSurchargesSumQBData,
} from './controller.js';

const router = new Router();

router.get('/', getBillableSurcharges);
router.get('/qb', validate(qbParams, 'query'), skipBodyLogging, getSurchargesQBData);
router.get('/qb-sum', validate(qbSumParams, 'query'), getSurchargesSumQBData);
router.get('/:id', getBillableSurchargeById);
router.post('/', validate(billableSurchargeData), createBillableSurcharge);
router.put('/:id', validate(billableSurchargeData), editBillableSurcharge);
router.delete('/:id', deleteBillableSurcharge);

export default router.routes();
