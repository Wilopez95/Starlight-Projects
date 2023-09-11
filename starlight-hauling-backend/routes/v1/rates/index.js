import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';

import { authorized } from '../../../middlewares/authorized.js';
import { PERMISSIONS } from '../../../consts/permissions.js';
import globalRateRoutes from './global/index.js';
import customRateRoutes from './custom/index.js';

import {
  batchRatesUpdate,
  selectRatesGroup,
  calcRates,
  getRateLinkedItems,
  getBatchUpdateTargetRateGroups,
  getHistoricalRates,
  selectRatesGroupRecurrentOrder,
} from './controller.js';
import {
  batchUpdateData,
  selectRatesParams,
  calcRatesParams,
  batchUpdateTargetData,
  historicalRates,
} from './schema.js';

const router = new Router();

router.use('/global', globalRateRoutes);
router.use('/custom', customRateRoutes);

router.get('/linked', authorized([PERMISSIONS.configurationPriceGroupsView]), getRateLinkedItems);

router.post(
  '/batch-target',
  authorized([PERMISSIONS.configurationPriceGroupsBulkUpdate]),
  validate(batchUpdateTargetData),
  getBatchUpdateTargetRateGroups,
);
router.post(
  '/batch',
  authorized([PERMISSIONS.configurationPriceGroupsBulkUpdate]),
  validate(batchUpdateData),
  batchRatesUpdate,
);

router.post(
  '/select',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(selectRatesParams),
  selectRatesGroup,
);
router.post(
  '/selectRecurrent',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(selectRatesParams),
  selectRatesGroupRecurrentOrder,
);
router.post(
  '/calc',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(calcRatesParams),
  calcRates,
);

router.get(
  '/history',
  authorized([PERMISSIONS.configurationPriceGroupsViewHistory]),
  validate(historicalRates, 'query'),
  getHistoricalRates,
);

export default router.routes();
