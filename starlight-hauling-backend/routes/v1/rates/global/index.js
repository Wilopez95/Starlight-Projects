import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { authorized } from '../../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../../consts/permissions.js';
import {
  globalRatesServiceData,
  globalRatesRecurringServiceData,
  globalRatesLineItemData,
  globalRatesRecurringLineItemData,
  globalRatesThresholdData,
  globalRatesSurchargeData,
  serviceParams,
  lineItemParams,
  surchargeParams,
  thresholdParams,
  globalRatesThresholdParam,
  globalThresholdSetting,
  recurringServiceParams,
} from './schema.js';
import {
  getGlobalRatesServices,
  setGlobalRatesServices,
  getGlobalRatesRecurringServices,
  setGlobalRatesRecurringServices,
  getGlobalRatesLineItems,
  setGlobalRatesLineItems,
  getGlobalRatesRecurringLineItems,
  setGlobalRatesRecurringLineItems,
  getGlobalRatesThresholds,
  setGlobalRatesThresholds,
  getGlobalThresholdsSetting,
  setGlobalThresholdsSetting,
  getGlobalRatesSurcharges,
  setGlobalRatesSurcharges,
  getGlobalRatesSurchargesBy,
} from './controller.js';

const router = new Router();

router.get(
  '/services',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(serviceParams, 'query'),
  getGlobalRatesServices,
);
router.patch(
  '/services',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(globalRatesServiceData),
  setGlobalRatesServices,
);

router.get(
  '/recurring-services',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(recurringServiceParams, 'query'),
  getGlobalRatesRecurringServices,
);
router.patch(
  '/recurring-services',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(globalRatesRecurringServiceData),
  setGlobalRatesRecurringServices,
);

router.get(
  '/line-items',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(lineItemParams, 'query'),
  getGlobalRatesLineItems,
);
router.patch(
  '/line-items',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(globalRatesLineItemData),
  setGlobalRatesLineItems,
);

router.get(
  '/surcharges',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(surchargeParams, 'query'),
  getGlobalRatesSurcharges,
);
router.patch(
  '/surcharges',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(globalRatesSurchargeData),
  setGlobalRatesSurcharges,
);

router.get(
  '/surchargesBy',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(surchargeParams, 'query'),
  getGlobalRatesSurchargesBy,
);

router.get(
  '/recurring-line-items',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(lineItemParams, 'query'),
  getGlobalRatesRecurringLineItems,
);
router.patch(
  '/recurring-line-items',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(globalRatesRecurringLineItemData),
  setGlobalRatesRecurringLineItems,
);

router.get(
  '/thresholds',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(thresholdParams, 'query'),
  getGlobalRatesThresholds,
);
router.get(
  '/thresholds/:thresholdId/setting',
  authorized([PERMISSIONS.configurationPriceGroupsView]),
  validate(globalRatesThresholdParam, 'query'),
  getGlobalThresholdsSetting,
);
router.patch(
  '/thresholds',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(globalRatesThresholdData),
  setGlobalRatesThresholds,
);
router.patch(
  '/thresholds/:thresholdId/setting',
  authorized([PERMISSIONS.configurationPriceGroupsUpdate]),
  validate(globalThresholdSetting),
  setGlobalThresholdsSetting,
);

export default router.routes();
