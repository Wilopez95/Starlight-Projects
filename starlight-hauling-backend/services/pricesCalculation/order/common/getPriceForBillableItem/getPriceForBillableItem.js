import find from 'lodash/find.js';
import omit from 'lodash/omit.js';
import merge from 'lodash/merge.js';
import clone from 'lodash/clone.js';
// import { logger } from '../../../../../utils/logger.js';

const defaultConditions = {
  oneTimeService: {
    billableServiceId: 0,
    materialId: 0,
    equipmentItemId: 0,
  },
  oneTimeLineItem: {
    billableLineItemId: 0,
    materialId: 0,
  },
  threshold: {
    thresholdId: 0,
    materialId: 0,
    equipmentItemId: 0,
  },
  surcharge: {
    surchargeId: 0,
    materialId: 0,
  },
};

const getPriceForBillableItem = (conditions = {}, prices = {}) => {
  // logger.debug(`getPriceForBillableItem->conditions: ${JSON.stringify(conditions, null, 2)}`);
  // logger.debug(`getPriceForBillableItem->prices: ${JSON.stringify(prices, null, 2)}`);
  const { general = [], custom = [] } = prices ?? {};
  const predicate = merge(
    clone(defaultConditions[conditions.entityType] ?? {}),
    omit(conditions, ['entityType']),
  );
  // logger.debug(`getPriceForBillableItem->predicate: ${JSON.stringify(predicate, null, 2)}`);

  if (!conditions.entityType) {
    return null;
  }

  if (custom?.length) {
    return find(custom, predicate) || find(general, predicate) || null;
  }

  return general?.length ? find(general, predicate) ?? null : null;
};

export default getPriceForBillableItem;
