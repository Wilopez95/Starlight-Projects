import Router from '@koa/router';
import validate from '../../../middlewares/validate.js';
import {
  createTermsAndConditions,
  editTermsAndConditions,
  getTermAndConditionsById,
  getTermAndConditionsByReqId,
  updateTermsAndConditionsByReqId,
} from './controller.js';
import { createdTermsAndConditions, updatedTermsAndConditions } from './schema.js';

const router = new Router();

router.get('/:id', getTermAndConditionsById);
router.get('/:tenantName/:reqId', getTermAndConditionsByReqId);
router.post('/', validate(createdTermsAndConditions), createTermsAndConditions);
router.put('/acceptance', updateTermsAndConditionsByReqId);
router.put('/:id', validate(updatedTermsAndConditions), editTermsAndConditions);

export default router.routes();
