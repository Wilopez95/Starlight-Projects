import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { businessLineData, activeOnly } from './schema.js';

import {
  getBusinessLines,
  getDefaultBusinessLines,
  createBusinessLine,
  editBusinessLine,
  // deleteBusinessLine,
} from './controller.js';

const router = new Router();

router.get('/', validate(activeOnly, 'query'), getBusinessLines);
router.get('/default', getDefaultBusinessLines);
router.post('/', validate(businessLineData), createBusinessLine);
router.put('/:id', validate(businessLineData), editBusinessLine);
// router.delete('/:id', deleteBusinessLine);

export default router.routes();
