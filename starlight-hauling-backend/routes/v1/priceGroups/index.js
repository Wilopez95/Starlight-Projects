import Router from '@koa/router';

import { authorized } from '../../../middlewares/authorized.js';
import validate from '../../../middlewares/validate.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import {
  getGeneralPricesSchema,
  setGeneralPricesSchema,
  getAllPricesSchema,
  setCustomPricesSchema,
  createPriceGroupSchema,
  updatePriceGroupSchema,
  getPriceGroupsSchema,
  batchUpdateData,
  getCustomPricesHistorySchema,
  getGeneralPricesHistorySchema,
} from './schema.js';

import {
  getGeneralPrices,
  setGeneralPrices,
  getPricesByPriceGroup,
  setCustomPrices,
  createPriceGroup,
  updatePriceGroup,
  deletePriceGroup,
  getPriceGroup,
  duplicatePriceGroup,
  getCustomPriceGroups as getPriceGroups,
  batchRatesUpdate,
  batchRatesPreview,
  getGeneralPricesHistory,
  getCustomPricesHistory,
  getLinkedPriceGroups,
} from './controller.js';

const router = new Router();

// v1/price-groups                    - for creation of price groups
// v1/price-groups/batch              - for bulk updates of rates of many price groups
// v1/price-groups/batch/preview      - for preview of bulk rate updates
// v1/price-groups/:id                - for reading, editing and deletion of price group
// v1/price-groups/:id/clone          - for cloning of price group with its prices
// v1/price-groups/:id/prices         - for creation, reading, editing (recreation) of prices
//                                      inside certain price group
// v1/price-groups/:id/prices/history - for getting history of certain prices

router.get(
  '/general/prices',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(getGeneralPricesSchema, 'query'),
  getGeneralPrices,
);

router.put(
  '/general/prices',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(setGeneralPricesSchema),
  setGeneralPrices,
);

router.get(
  '/general/prices/history',
  authorized([PERMISSIONS.configurationPriceGroupsViewHistory]),
  validate(getGeneralPricesHistorySchema, 'query'),
  getGeneralPricesHistory,
);

// get custom group' prices
router.get(
  '/:id/prices',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(getAllPricesSchema, 'query'),
  getPricesByPriceGroup,
);

router.get(
  '/:id/prices/history',
  authorized([PERMISSIONS.configurationPriceGroupsViewHistory]),
  validate(getCustomPricesHistorySchema, 'query'),
  getCustomPricesHistory,
);

router.put(
  '/:id/prices',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(setCustomPricesSchema),
  setCustomPrices,
);

router.post(
  '/',
  authorized([PERMISSIONS.configurationPriceGroupsCreate]),
  validate(createPriceGroupSchema),
  createPriceGroup,
);

router.get(
  '/',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(getPriceGroupsSchema, 'query'),
  getPriceGroups,
);

router.post(
  '/batch',
  authorized([PERMISSIONS.configurationPriceGroupsBulkUpdate]),
  validate(batchUpdateData),
  batchRatesUpdate,
);

router.post(
  '/batch/preview',
  authorized([PERMISSIONS.configurationPriceGroupsBulkUpdate]),
  validate(batchUpdateData),
  batchRatesPreview,
);

router.get('/linked', authorized([PERMISSIONS.configurationPriceGroupsView]), getLinkedPriceGroups);

router.get('/:id', authorized([PERMISSIONS.configurationPriceGroupsView]), getPriceGroup);

router.put(
  '/:id',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(updatePriceGroupSchema),
  updatePriceGroup,
);

router.post(
  '/:id/clone',
  authorized([PERMISSIONS.configurationPriceGroupsCreate]),
  validate(createPriceGroupSchema),
  duplicatePriceGroup,
);

router.delete('/:id', authorized([PERMISSIONS.configurationPriceGroupsDelete]), deletePriceGroup);

export default router.routes();
