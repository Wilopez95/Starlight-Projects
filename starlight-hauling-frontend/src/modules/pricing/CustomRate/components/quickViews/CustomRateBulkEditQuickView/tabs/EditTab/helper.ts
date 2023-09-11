import { BulkRatesEditType, IBulkRatesEditFormData } from '../../types';

import { INCLUDE_ALL, INCLUDE_NONE_MATERIAL } from './const';

export const getEditDataPayload = (type: BulkRatesEditType): Partial<IBulkRatesEditFormData> => {
  switch (type) {
    case BulkRatesEditType.allBillableItems:
      return {
        lineItems: [INCLUDE_ALL],
        equipmentItems: [INCLUDE_ALL],
        materials: [INCLUDE_ALL, INCLUDE_NONE_MATERIAL],
        services: [INCLUDE_ALL],
        applyTo: [],
        pairCustomerIds: [],
      };
    case BulkRatesEditType.allServices:
    case BulkRatesEditType.allRecurringServices:
      return {
        lineItems: [INCLUDE_ALL],
        equipmentItems: [INCLUDE_ALL],
        materials: [INCLUDE_ALL, INCLUDE_NONE_MATERIAL],
        services: [INCLUDE_ALL],
        applyTo: [],
        pairCustomerIds: [],
      };
    case BulkRatesEditType.specificServices:
    case BulkRatesEditType.specificRecurringServices:
      return {
        lineItems: [],
        equipmentItems: [INCLUDE_ALL],
        materials: [INCLUDE_ALL, INCLUDE_NONE_MATERIAL],
        services: [],
        applyTo: [],
        pairCustomerIds: [],
      };
    case BulkRatesEditType.allLineItems:
    case BulkRatesEditType.allRecurringLineItems:
      return {
        lineItems: [INCLUDE_ALL],
        equipmentItems: [],
        materials: [INCLUDE_ALL, INCLUDE_NONE_MATERIAL],
        services: [],
        applyTo: [],
        pairCustomerIds: [],
      };
    case BulkRatesEditType.specificLineItems:
    case BulkRatesEditType.specificRecurringLineItems:
      return {
        lineItems: [],
        equipmentItems: [],
        materials: [INCLUDE_ALL, INCLUDE_NONE_MATERIAL],
        services: [],
        applyTo: [],
        pairCustomerIds: [],
      };
    default:
      return {
        lineItems: [],
        equipmentItems: [],
        materials: [],
        services: [],
        applyTo: [],
        pairCustomerIds: [],
      };
  }
};

export const getBillableItemsList = (isRollOff: boolean) => {
  return isRollOff
    ? [
        BulkRatesEditType.allBillableItems,
        BulkRatesEditType.allServices,
        BulkRatesEditType.specificServices,
        BulkRatesEditType.allLineItems,
        BulkRatesEditType.specificLineItems,
      ]
    : [
        BulkRatesEditType.allBillableItems,
        BulkRatesEditType.allServices,
        BulkRatesEditType.specificServices,
        BulkRatesEditType.allRecurringServices,
        BulkRatesEditType.specificRecurringServices,
        BulkRatesEditType.allLineItems,
        BulkRatesEditType.specificLineItems,
        BulkRatesEditType.allRecurringLineItems,
        BulkRatesEditType.specificRecurringLineItems,
      ];
};
