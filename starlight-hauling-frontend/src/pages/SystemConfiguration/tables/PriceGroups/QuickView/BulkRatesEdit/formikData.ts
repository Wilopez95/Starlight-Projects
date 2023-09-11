import { startOfToday } from 'date-fns';
import i18next from 'i18next';
import * as Yup from 'yup';

import { notNullObject, priceValidator } from '@root/helpers';

import { INCLUDE_ALL, INCLUDE_NONE_MATERIAL } from './tabs/EditTab/const';
import { BulkRatesAffectedEntity, BulkRatesEditType, IBulkRatesData } from './types';

export const bulkRatesValidationSchema = Yup.object().shape({
  edit: Yup.object({
    value: Yup.number()
      .typeError('Price value must be a number')
      .positive('Price value must be greater than zero')
      .test('price', i18next.t('ValidationErrors.IncorrectPriceFormat'), priceValidator)
      .required('Price value is require'),
    effectiveDate: Yup.date()
      .nullable()
      .required('Effective Date is required')
      .typeError('Must be a valid date'),
    applyTo: Yup.array().of(Yup.number()).min(1, 'At least one item should be selected'),
    lineItems: Yup.array().when('type', {
      is: BulkRatesEditType.specificLineItems,
      then: Yup.array().min(1, 'At least one item should be selected'),
    }),
    services: Yup.array().when('type', {
      is: BulkRatesEditType.specificServices,
      then: Yup.array().min(1, 'At least one item should be selected'),
    }),
    materials: Yup.array().min(1, 'At least one item should be selected'),
    equipmentItems: Yup.array().when('type', {
      is: BulkRatesEditType.allServices,
      then: Yup.array().min(1, 'At least one item should be selected'),
    }),

    pairCustomerIds: Yup.array().when('application', {
      is: BulkRatesAffectedEntity.customerJobSites,
      then: Yup.array().of(Yup.number()).min(1, 'At least one item should be selected'),
    }),
  }),
  preview: Yup.object({
    services: Yup.array(),
    lineItems: Yup.array(),
    recurringLineItems: Yup.array(),
    recurringServices: Yup.array(),
  }),
});

const defaultValue: IBulkRatesData = {
  edit: {
    businessLineId: '',
    businessUnitId: '',
    type: BulkRatesEditType.allBillableItems,
    target: 'all',
    direction: 'increase',
    application: BulkRatesAffectedEntity.customers,
    calculation: 'percentage',
    source: 'global',
    value: 10,
    equipmentItems: [INCLUDE_ALL],
    lineItems: [INCLUDE_ALL],
    materials: [INCLUDE_ALL, INCLUDE_NONE_MATERIAL],
    services: [INCLUDE_ALL],
    applyTo: [],
    pairCustomerIds: [],
    effectiveDate: startOfToday(),
    overrideUpdates: false,
    checkPendingUpdates: false,
  },
  preview: {
    priceGroupId: 0,
    services: [],
    lineItems: [],
    recurringLineItems: [],
    recurringServices: [],
  },
};

export const getBulkRatesValues = (item?: IBulkRatesData): IBulkRatesData => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
