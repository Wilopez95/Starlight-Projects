import Router from '@koa/router';

import { chargeDeferredPayments, requestSettlements } from './controller.js';

const router = new Router();

router.post('/charge-deferred', chargeDeferredPayments);
router.post('/request-settlements', requestSettlements);

export default router.routes();
