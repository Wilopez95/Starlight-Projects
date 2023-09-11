import { isEmpty } from 'lodash-es';

import { AllEntitiesType, BulkRatesEditType, BulkRatesTarget, BulkRatesTargetType } from './types';

export const filterRatesArray = <T>(array: (number | AllEntitiesType | T)[] = []) => {
  return isEmpty(array) ? undefined : array;
};

export const defineTarget = (type: BulkRatesEditType): BulkRatesTarget => {
  if (type === BulkRatesEditType.allServices || type === BulkRatesEditType.specificServices) {
    return BulkRatesTargetType.services;
  }
  if (
    type === BulkRatesEditType.allRecurringServices ||
    type === BulkRatesEditType.specificRecurringServices
  ) {
    return BulkRatesTargetType.recurringServices;
  }
  if (type === BulkRatesEditType.allLineItems || type === BulkRatesEditType.specificLineItems) {
    return BulkRatesTargetType.lineItems;
  }
  if (
    type === BulkRatesEditType.allRecurringLineItems ||
    type === BulkRatesEditType.specificRecurringLineItems
  ) {
    return BulkRatesTargetType.recurringLineItems;
  }

  return BulkRatesTargetType.all;
};
