import { isEmpty } from 'lodash-es';

import { AllEntitiesType, BulkRatesEditType, BulkRatesTarget } from './types';

export const filterRatesArray = <T>(array: (number | AllEntitiesType | T)[] = []) => {
  return isEmpty(array) ? undefined : array;
};

export const defineTarget = (type: BulkRatesEditType): BulkRatesTarget => {
  if (type === BulkRatesEditType.allServices || type === BulkRatesEditType.specificServices) {
    return 'services';
  }
  if (type === BulkRatesEditType.allLineItems || type === BulkRatesEditType.specificLineItems) {
    return 'lineItems';
  }

  return 'all';
};
