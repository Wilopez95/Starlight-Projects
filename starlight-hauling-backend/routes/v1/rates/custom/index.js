import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { authorized } from '../../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../../consts/permissions.js';
import {
  customRatesGroupData,
  activeOnly,
  paginationParams,
  groupTypeFilter,
  filterByIds,
  customerGroupRatesServiceData,
  customerGroupRatesLineItemData,
  customerGroupRatesThresholdData,
  customerGroupRatesSurchargeData,
  serviceParams,
  lineItemParams,
  thresholdParams,
  surchargeParams,
  updateThresholdSettingData,
} from './schema.js';
import {
  getCustomRatesGroup,
  getSpecificCustomRatesGroups,
  getCustomRatesGroupById,
  createCustomRatesGroup,
  editCustomRatesGroup,
  updateCustomRatesGroupThresholdSetting,
  deleteCustomRatesGroup,
  duplicateCustomRatesGroup,
  getCustomRatesGroupServices,
  setCustomRatesGroupServices,
  getCustomRatesGroupLineItems,
  setCustomRatesGroupLineItems,
  getCustomRatesGroupSurcharges,
  setCustomRatesGroupSurcharges,
  getCustomRatesGroupThresholds,
  setCustomRatesGroupThresholds,
  getCustomRatesGroupSurchargesBy,
} from './controller.js';

const router = new Router();

router.get(
  '/surchargesBy',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(surchargeParams, 'query'),
  getCustomRatesGroupSurchargesBy,
);

router.get(
  '/',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(activeOnly, 'query'),
  validate(paginationParams, 'query'),
  validate(groupTypeFilter, 'query'),
  getCustomRatesGroup,
);
router.get(
  '/specific',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(filterByIds, 'query'),
  validate(paginationParams, 'query'),
  getSpecificCustomRatesGroups,
);
router.get('/:id', authorized([PERMISSIONS.configurationPriceGroupsView]), getCustomRatesGroupById);
router.post(
  '/',
  authorized([PERMISSIONS.configurationPriceGroupsCreate]),
  validate(customRatesGroupData),
  createCustomRatesGroup,
);
router.put(
  '/:id',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(customRatesGroupData),
  editCustomRatesGroup,
);
router.patch(
  '/:id',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(updateThresholdSettingData),
  updateCustomRatesGroupThresholdSetting,
);
router.delete(
  '/:id',
  authorized([PERMISSIONS.configurationPriceGroupsDelete]),
  deleteCustomRatesGroup,
);

router.post(
  '/:id/duplicate',
  authorized([PERMISSIONS.configurationPriceGroupsCreate]),
  validate(customRatesGroupData),
  duplicateCustomRatesGroup,
);
// services pricing
router.get(
  '/:id/services',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(serviceParams, 'query'),
  getCustomRatesGroupServices,
);
router.patch(
  '/:id/services',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(customerGroupRatesServiceData),
  setCustomRatesGroupServices,
);
// line items pricing
router.get(
  '/:id/line-items',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(lineItemParams, 'query'),
  getCustomRatesGroupLineItems,
);
router.patch(
  '/:id/line-items',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(customerGroupRatesLineItemData),
  setCustomRatesGroupLineItems,
);
// thresholds
router.get(
  '/:id/thresholds',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(thresholdParams, 'query'),
  getCustomRatesGroupThresholds,
);
router.patch(
  '/:id/thresholds',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(customerGroupRatesThresholdData),
  setCustomRatesGroupThresholds,
);
// surcharges pricing
router.get(
  '/:id/surcharges',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(surchargeParams, 'query'),
  getCustomRatesGroupSurcharges,
);
router.patch(
  '/:id/surcharges',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(customerGroupRatesSurchargeData),
  setCustomRatesGroupSurcharges,
);

export default router.routes();
