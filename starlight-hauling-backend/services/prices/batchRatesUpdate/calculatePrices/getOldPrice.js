import { PRICE_ENTITY_TYPE } from '../../../../consts/priceEntityTypes.js';

const baseFields = ['entityType', 'materialId'];
const findByKeys = (oldPrices, generalPrice, keys) =>
  oldPrices.find(price => keys.every(key => price[key] === generalPrice[key]));

const getOldPrice = (oldPrices, generalPrice) => {
  if (generalPrice.entityType === PRICE_ENTITY_TYPE.oneTimeService) {
    return findByKeys(oldPrices, generalPrice, [
      ...baseFields,
      'billableServiceId',
      'equipmentItemId',
    ]);
  }
  if (generalPrice.entityType === PRICE_ENTITY_TYPE.oneTimeLineItem) {
    return findByKeys(oldPrices, generalPrice, [...baseFields, 'billableLineItemId']);
  }
  if (generalPrice.entityType === PRICE_ENTITY_TYPE.recurringLineItem) {
    return findByKeys(oldPrices, generalPrice, [
      ...baseFields,
      'billableLineItemId',
      'billingCycle',
    ]);
  }

  if (generalPrice.entityType === PRICE_ENTITY_TYPE.recurringService) {
    return findByKeys(oldPrices, generalPrice, [
      ...baseFields,
      'billableServiceId',
      'billingCycle',
      'equipmentItemId',
      'frequencyId',
    ]);
  }
  return null;
};

export default getOldPrice;
