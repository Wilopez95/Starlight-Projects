import { TFunction } from 'i18next';
import * as Yup from 'yup';

import {
  actionOptions,
  BillableItemActionEnum,
  BillableLineItemUnitTypeEnum,
  billingCycles,
  FrequencyTypes,
  lineItemOptions,
  ProrationTypeEnum,
  prorationTypes,
  recurringActionOptions,
  recyclingActionOptions,
  recyclingLineItemOptions,
  SurchargeCalculation,
} from '@root/consts';
import { isCore } from '@root/consts/env';
import { notNullObject } from '@root/helpers';
import { BillableServiceStore } from '@root/stores/billableService/BillableServiceStore';
import { BillableService, LineItem, Threshold } from '@root/stores/entities';
import { LineItemStore } from '@root/stores/lineItem/LineItemStore';
import { Surcharge } from '@root/stores/surcharge/Surcharge';
import { SurchargeStore } from '@root/stores/surcharge/SurchargeStore';
import { ThresholdStore } from '@root/stores/threshold/ThresholdStore';
import { IBillableService, ILineItem, ISurcharge, IThreshold } from '@root/types';

import { BillableItemType, BillableItemTypes, EntityType } from './types';

const billingUnits = Object.values(BillableLineItemUnitTypeEnum);

const getLineItemValidationSchema = (
  lineItemStore: LineItemStore,
  t: TFunction,
  i18n: string,
  isDuplicate: boolean,
) => {
  const currentId = lineItemStore.selectedEntity?.id;
  let lineItems = lineItemStore.values;

  if (currentId && !isDuplicate) {
    lineItems = lineItems.filter(lineItem => lineItem.id !== currentId);
  }
  const descriptions = lineItems.map(lineItem => lineItem.description);

  return Yup.object().shape({
    oneTime: Yup.bool().required(),
    description: Yup.string()
      .trim()
      .max(120, t(`ValidationErrors.PleaseEnterUpTo`, { number: 120 }))
      .required(t(`${i18n}DescriptionRequired`))
      .notOneOf(descriptions, t(`${i18n}DescriptionUniq`)),
    active: Yup.bool().required(t(`${i18n}StatusRequired`)),
    type: Yup.string().when('oneTime', {
      is: true,
      then: Yup.string()
        .oneOf(lineItemOptions.concat(recyclingLineItemOptions), t(`${i18n}InvalidType`))
        .required(t(`${i18n}TypeRequired`)),
    }),
    unit: Yup.string().when(['oneTime'], {
      is: true,
      then: Yup.string()
        .oneOf(billingUnits)
        .required(t(`${i18n}UnitRequired`)),
    }),
    billingCycles: Yup.array().when('oneTime', {
      is: false,
      then: Yup.array()
        .of(Yup.string().oneOf(billingCycles))
        .required(t(`${i18n}AtLeast1Billing`)),
    }),
    materialIds: Yup.array().when('oneTime', {
      is: true,
      then: Yup.array().of(Yup.number()).ensure(),
    }),
  });
};

const getSurchargeValidationSchema = (
  surchargeStore: SurchargeStore,
  t: TFunction,
  i18n: string,
  isDuplicate: boolean,
) => {
  const currentId = surchargeStore.selectedEntity?.id;
  let surcharges = surchargeStore.values;

  if (currentId && !isDuplicate) {
    surcharges = surcharges.filter(surcharge => surcharge.id !== currentId);
  }
  const descriptions = surcharges.map(lineItem => lineItem.description);

  return Yup.object().shape({
    calculation: Yup.string(),
    description: Yup.string()
      .trim()
      .max(120, t(`ValidationErrors.PleaseEnterUpTo`, { number: 120 }))
      .required(t(`${i18n}DescriptionRequired`))
      .notOneOf(descriptions, t(`${i18n}DescriptionUniq`)),
    active: Yup.bool().required(t(`${i18n}StatusRequired`)),
  });
};

const getBillableServiceValidationSchema = (
  billableServiceStore: BillableServiceStore,
  t: TFunction,
  i18n: string,
  isDuplicate: boolean,
) => {
  const currentId = billableServiceStore.selectedEntity?.id;
  let services = billableServiceStore.values;

  if (currentId && !isDuplicate) {
    services = services.filter(service => service.id !== currentId);
  }

  const descriptions = services.map(service => service.description);

  return Yup.object().shape({
    description: Yup.string()
      .trim()
      .max(120, t(`ValidationErrors.PleaseEnterUpTo`, { number: 120 }))
      .required(t(`${i18n}DescriptionRequired`))
      .notOneOf(descriptions, t(`${i18n}DescriptionUniq`)),
    active: Yup.bool().required(),
    materialBasedPricing: Yup.bool().required(),
    // TODO discuss allowed and disallowed characters; for now, allow anything
    importCodes: Yup.string()
      .nullable()
      .max(50, t(`ValidationErrors.PleaseEnterUpTo`, { number: 50 })),
    unit: Yup.string()
      .oneOf(billingUnits)
      .required(t(`${i18n}UnitRequired`)),
    action: Yup.string().when('oneTime', {
      is: true,
      then: Yup.string()
        .oneOf(actionOptions.concat(recyclingActionOptions).map(option => option.value.toString()))
        .required(t(`${i18n}ActionRequired`)),
      otherwise: Yup.string()
        .oneOf(recurringActionOptions.map(option => option.value.toString()))
        .required(t(`${i18n}ActionRequired`)),
    }),
    equipmentItemId: Yup.number()
      .notOneOf([0], t(`${i18n}EquipmentRequired`))
      .required(t(`${i18n}EquipmentRequired`)),
    oneTime: Yup.bool().required(),
    frequencies: Yup.array().when(['oneTime', 'action'], (oneTime: boolean, action: string) => {
      const schema = Yup.array().of(
        Yup.object().shape({
          type: Yup.string().oneOf(FrequencyTypes),
          times: Yup.number()
            .nullable()
            .optional()
            .positive(t(`${i18n}PriceMustBeGreaterThanZero`)),
        }),
      );

      if (!oneTime) {
        if (action !== 'service') {
          return schema;
        }

        return schema.required(t(`${i18n}FrequenciesRequired`));
      }
    }),
    billingCycles: Yup.array().when(['oneTime'], {
      is: false,
      then: Yup.array()
        .of(Yup.string().oneOf(billingCycles))
        .required(t(`${i18n}AtLeast1Billing`)),
    }),
    services: Yup.array().when(['oneTime', 'action'], {
      is: (oneTime: boolean, action: string) => !oneTime && action === 'service',
      then: Yup.array().of(Yup.string()).nullable(),
      otherwise: Yup.array().nullable(),
    }),
    prorationType: Yup.string().oneOf(prorationTypes),
  });
};

const getThresholdValidationSchema = (
  thresholdStore: ThresholdStore,
  t: TFunction,
  i18n: string,
  isDuplicate: boolean,
) => {
  const currentId = thresholdStore.selectedEntity?.id;
  let thresholds = thresholdStore.values;

  if (currentId && !isDuplicate) {
    thresholds = thresholds.filter(threshold => threshold.id !== currentId);
  }

  const descriptions = thresholds.map(threshold => threshold.description);

  return Yup.object().shape({
    description: Yup.string()
      .trim()
      .max(120, t(`ValidationErrors.PleaseEnterUpTo`, { number: 120 }))
      .required(t(`${i18n}DescriptionRequired`))
      .notOneOf(descriptions, t(`${i18n}DescriptionUniq`)),
  });
};

export const getValidationSchema = (
  selectedTab: BillableItemTypes,
  store: LineItemStore | BillableServiceStore | ThresholdStore | SurchargeStore,
  t: TFunction,
  i18n: string,
  isDuplicate: boolean,
) => {
  switch (selectedTab) {
    case BillableItemType.service:
    case BillableItemType.recurringService:
      return getBillableServiceValidationSchema(
        store as BillableServiceStore,
        t,
        i18n,
        isDuplicate,
      );
    case BillableItemType.lineItem:
    case BillableItemType.recurringLineItem:
      return getLineItemValidationSchema(store as LineItemStore, t, i18n, isDuplicate);
    case BillableItemType.threshold:
      return getThresholdValidationSchema(store as ThresholdStore, t, i18n, isDuplicate);
    case BillableItemType.surcharge:
      return getSurchargeValidationSchema(store as SurchargeStore, t, i18n, isDuplicate);
    default:
      return null;
  }
};

const defaultBillableService: IBillableService = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  equipmentItemId: 0,
  action: isCore ? BillableItemActionEnum.delivery : BillableItemActionEnum.none,
  unit: BillableLineItemUnitTypeEnum.EACH,
  importCodes: null,
  description: '',
  allowForRecurringOrders: false,
  oneTime: true,
  businessLineId: '',
  applySurcharges: true,
  materialBasedPricing: false,
  spUsed: false,
};

const defaultRecurringBillableService: IBillableService = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  equipmentItemId: 0,
  action: BillableItemActionEnum.rental,
  unit: BillableLineItemUnitTypeEnum.EACH,
  importCodes: null,
  description: '',
  allowForRecurringOrders: false,
  services: [],
  frequencies: undefined,
  billingCycles: [],
  oneTime: false,
  businessLineId: '',
  prorationType: ProrationTypeEnum.usageDays,
  applySurcharges: true,
  materialBasedPricing: false,
  spUsed: false,
};

const defaultLineItem: ILineItem = {
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  id: 0,
  unit: BillableLineItemUnitTypeEnum.EACH,
  oneTime: true,
  type: 'none',
  description: '',
  businessLineId: '',
  materialBasedPricing: false,
  applySurcharges: true,
  materialIds: [],
};

const defaultSurcharge: ISurcharge = {
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  id: 0,
  calculation: SurchargeCalculation.Percentage,
  description: '',
  businessLineId: '',
  materialBasedPricing: false,
};

const defaultRecurringLineItem: ILineItem = {
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  id: 0,
  oneTime: false,
  description: '',
  businessLineId: '',
  billingCycles: [],
  materialBasedPricing: false,
  applySurcharges: true,
};

const defaultThreshold: IThreshold = {
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  id: 0,
  type: 'overweight',
  description: '',
  businessLineId: '',
  applySurcharges: true,
  unit: 'ton',
};

export const getDuplicateValues = (
  currentType: BillableItemTypes,
  item: EntityType,
): EntityType => {
  switch (currentType) {
    case BillableItemType.service:
      return {
        ...notNullObject(item as IBillableService, defaultBillableService),
        description: '',
      };

    case BillableItemType.recurringService:
      return {
        ...notNullObject(item as IBillableService, defaultRecurringBillableService),
        description: '',
      };

    case BillableItemType.lineItem:
      return {
        ...notNullObject(item as ILineItem, defaultLineItem),
        description: '',
      };

    case BillableItemType.recurringLineItem:
      return {
        ...notNullObject(item as ILineItem, defaultRecurringLineItem),
        description: '',
      };

    default:
      return notNullObject(item as IBillableService, defaultBillableService);
  }
};

export const getValues = (
  currentType: BillableItemTypes,
  businessLineId: string,
  item?: EntityType | null,
): EntityType => {
  if (!item) {
    switch (currentType) {
      case BillableItemType.service:
        return { ...defaultBillableService, businessLineId };
      case BillableItemType.recurringService:
        return { ...defaultRecurringBillableService, businessLineId };
      case BillableItemType.lineItem:
        return { ...defaultLineItem, businessLineId };
      case BillableItemType.recurringLineItem:
        return { ...defaultRecurringLineItem, businessLineId };
      case BillableItemType.threshold:
        return { ...defaultThreshold, businessLineId };
      case BillableItemType.surcharge:
        return { ...defaultSurcharge, businessLineId };
      default:
    }
  }

  if (currentType === BillableItemType.service && item instanceof BillableService) {
    return notNullObject(item, defaultBillableService);
  } else if (currentType === BillableItemType.recurringService && item instanceof BillableService) {
    return notNullObject(item, defaultRecurringBillableService);
  } else if (currentType === BillableItemType.threshold && item instanceof Threshold) {
    return notNullObject(item, defaultThreshold);
  } else if (currentType === BillableItemType.lineItem && item instanceof LineItem) {
    return notNullObject(item, defaultLineItem);
  } else if (currentType === BillableItemType.recurringLineItem && item instanceof LineItem) {
    return notNullObject(item, defaultRecurringLineItem);
  } else if (currentType === BillableItemType.surcharge && item instanceof Surcharge) {
    return notNullObject(item, defaultSurcharge);
  }

  return notNullObject(item as IBillableService, defaultBillableService);
};
