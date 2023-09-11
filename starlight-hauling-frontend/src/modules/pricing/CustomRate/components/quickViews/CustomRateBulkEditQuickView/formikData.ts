import { startOfToday } from 'date-fns';
import i18next from 'i18next';
import * as Yup from 'yup';

import { notNullObject, priceValidator } from '@root/helpers';

import { INCLUDE_ALL, INCLUDE_NONE_MATERIAL } from './tabs/EditTab/const';
import { BulkRatesAffectedEntity, BulkRatesEditType, IBulkRatesData } from './types';

export const bulkRatesValidationSchema = Yup.object().shape({
  edit: Yup.object({
    value: Yup.number()
      .typeError(i18next.t('ValidationErrors.PriceMustBeANumber'))
      .min(0, i18next.t('ValidationErrors.PriceGreaterThanZero'))
      .test('price', i18next.t('ValidationErrors.PriceIncorrectFormat'), priceValidator)
      .required(i18next.t('ValidationErrors.PriceIsRequired')),
    effectiveDate: Yup.date()
      .nullable()
      .required(i18next.t('ValidationErrors.EffectiveDateIsRequired'))
      .typeError(i18next.t('ValidationErrors.MustBeValidDate')),
    applyTo: Yup.array().of(Yup.number()).min(1, i18next.t('ValidationErrors.AtLeastOneItem')),
    lineItems: Yup.array().when('type', {
      is: BulkRatesEditType.specificLineItems,
      then: Yup.array().min(1, i18next.t('ValidationErrors.AtLeastOneItem')),
    }),
    services: Yup.array().when('type', {
      is: BulkRatesEditType.specificServices,
      then: Yup.array().min(1, i18next.t('ValidationErrors.AtLeastOneItem')),
    }),
    materials: Yup.array().min(1, i18next.t('ValidationErrors.AtLeastOneItem')),
    equipmentItems: Yup.array().when('type', {
      is: BulkRatesEditType.allServices,
      then: Yup.array().min(1, i18next.t('ValidationErrors.AtLeastOneItem')),
    }),
    pairCustomerIds: Yup.array().when('application', {
      is: BulkRatesAffectedEntity.customerJobSites,
      then: Yup.array().of(Yup.number()).min(1, i18next.t('ValidationErrors.AtLeastOneItem')),
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
    effectiveDate: startOfToday(),
    pairCustomerIds: [],
  },
  preview: {
    priceGroupId: 0,
    oneTimeService: [],
    oneTimeLineItem: [],
    recurringLineItem: [],
    recurringService: [],
  },
};

export const getBulkRatesValues = (item?: IBulkRatesData): IBulkRatesData => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
