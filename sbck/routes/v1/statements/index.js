import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import {
  financeChargeDraftSchema,
  statementDownloadSchema,
  statementViewSchema,
} from './schema.js';
import { financeChargeDraft, statementsDownload, statementView } from './controller.js';

const router = new Router();

router.get('/download', validate(statementDownloadSchema, 'query'), statementsDownload);
router.post('/view', validate(statementViewSchema, 'query'), statementView);
router.post('/finance-charge-draft', validate(financeChargeDraftSchema), financeChargeDraft);

export default router.routes();
