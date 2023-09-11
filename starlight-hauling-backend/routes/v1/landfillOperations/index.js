import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { processSearchQuery } from '../../../middlewares/requestParamsParser.js';

import {
  countParams,
  paginated,
  landfillInputData,
  landfillData,
  recyclingOrderQuery,
} from './schema.js';
import {
  getRecyclingOrder,
  syncWithRecycling,
  editLandfillOperation,
  getLandfillOperationsCount,
  getLandfillOperations,
  getLandfillOperationById,
} from './controller.js';

const router = new Router();

router.get('/recycling-order/:id', validate(recyclingOrderQuery, 'query'), getRecyclingOrder);

router.post('/sync', validate(landfillInputData), syncWithRecycling);
router.put('/:id', validate(landfillData), editLandfillOperation);

router.get(
  '/count',
  processSearchQuery.bind(null, 'query', false),
  validate(countParams, 'query'),
  getLandfillOperationsCount,
);
router.get(
  '/',
  processSearchQuery.bind(null, 'query', false),
  validate(paginated, 'query'),
  getLandfillOperations,
);
router.get('/:id', getLandfillOperationById);

export default router.routes();
