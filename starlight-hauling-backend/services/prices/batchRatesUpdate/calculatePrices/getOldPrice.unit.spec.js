import { oldPrices } from '../../__tests__/data/batchUpdate/prices.js';
import getGeneralPrice from './getOldPrice.js';

describe('getOldPrice', () => {
  test('no price', () => {
    const generalPrice = {
      entityType: 'ONE_TIME_SERVICE',
      billableServiceId: 5,
      billableLineItemId: null,
      equipmentItemId: 1,
      materialId: 1,
      price: 12e6,
    };
    const result = getGeneralPrice(oldPrices, generalPrice);
    expect(result).toBeUndefined();
  });

  test('one time service', () => {
    const generalPrice = {
      entityType: 'ONE_TIME_SERVICE',
      billableServiceId: 1,
      billableLineItemId: null,
      equipmentItemId: 1,
      materialId: 1,
      price: 1,
    };
    const result = getGeneralPrice(oldPrices, generalPrice);
    expect(result.price).toStrictEqual(111000000);
  });

  test('one time service non material', () => {
    const generalPrice = {
      entityType: 'ONE_TIME_SERVICE',
      billableServiceId: 2,
      billableLineItemId: null,
      equipmentItemId: 2,
      materialId: null,
      price: 1,
    };
    const result = getGeneralPrice(oldPrices, generalPrice);
    expect(result.price).toStrictEqual(122000000);
  });

  test('one time line item', () => {
    const generalPrice = {
      entityType: 'ONE_TIME_LINE_ITEM',
      billableServiceId: null,
      billableLineItemId: 1,
      materialId: null,
      price: 1,
    };
    const result = getGeneralPrice(oldPrices, generalPrice);
    expect(result.price).toStrictEqual(211000000);
  });

  test('recurring line item monthly', () => {
    const generalPrice = {
      entityType: 'RECURRING_LINE_ITEM',
      billableServiceId: null,
      billableLineItemId: 1,
      billingCycle: 'monthly',
      materialId: 1,
      price: 1,
    };
    const result = getGeneralPrice(oldPrices, generalPrice);
    expect(result.price).toStrictEqual(211000000);
  });

  test('recurring line item yearly', () => {
    const generalPrice = {
      entityType: 'RECURRING_LINE_ITEM',
      billableServiceId: null,
      billableLineItemId: 1,
      billingCycle: 'yearly',
      materialId: 1,
      price: 1,
    };
    const result = getGeneralPrice(oldPrices, generalPrice);
    expect(result.price).toStrictEqual(225000000);
  });

  test('recurring service daily', () => {
    const generalPrice = {
      entityType: 'RECURRING_SERVICE',
      billableServiceId: 12,
      billingCycle: 'daily',
      frequencyId: 1,
      price: 1,
    };
    const result = getGeneralPrice(oldPrices, generalPrice);
    expect(result.price).toStrictEqual(111000000);
  });

  test('recurring recurring item monthly', () => {
    const generalPrice = {
      entityType: 'RECURRING_SERVICE',
      billableServiceId: 12,
      billableLineItemId: null,
      equipmentItemId: 1,
      materialId: 1,
      billingCycle: 'monthly',
      frequencyId: 1,
      price: 1,
    };
    const result = getGeneralPrice(oldPrices, generalPrice);
    expect(result.price).toStrictEqual(121000000);
  });

  test('recurring service item monthly frequency', () => {
    const generalPrice = {
      entityType: 'RECURRING_SERVICE',
      billableServiceId: 12,
      billableLineItemId: null,
      equipmentItemId: 1,
      materialId: null,
      billingCycle: 'monthly',
      frequencyId: 2,
      price: 1,
    };
    const result = getGeneralPrice(oldPrices, generalPrice);
    expect(result.price).toStrictEqual(112000000);
  });
});
