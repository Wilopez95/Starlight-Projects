import { BulkRatesEditType, IBulkRatesEditData } from '../../types';

import { INCLUDE_ALL, INCLUDE_NONE_MATERIAL } from './const';

export const getEditDataPayload = (type: BulkRatesEditType): Partial<IBulkRatesEditData> => {
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
    case BulkRatesEditType.allLineItems:
      return {
        lineItems: [INCLUDE_ALL],
        equipmentItems: [],
        materials: [INCLUDE_ALL, INCLUDE_NONE_MATERIAL],
        services: [],
        applyTo: [],
        pairCustomerIds: [],
      };
    case BulkRatesEditType.allServices:
      return {
        lineItems: [],
        equipmentItems: [INCLUDE_ALL],
        materials: [INCLUDE_ALL, INCLUDE_NONE_MATERIAL],
        services: [INCLUDE_ALL],
        applyTo: [],
        pairCustomerIds: [],
      };
    case BulkRatesEditType.specificLineItems:
      return {
        lineItems: [INCLUDE_ALL],
        equipmentItems: [],
        materials: [],
        services: [],
        applyTo: [],
        pairCustomerIds: [],
      };
    case BulkRatesEditType.specificServices:
      return {
        lineItems: [],
        equipmentItems: [],
        materials: [],
        services: [INCLUDE_ALL],
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
