import i18next from 'i18next';
import * as Yup from 'yup';

import { BillingCycleEnum } from '@root/consts';
import { priceValidator } from '@root/helpers';
import { RatesEntityType } from '@root/modules/pricing/const';
import {
  IFutureCustomRate,
  ILineItemCustomRate,
  IRecurringLineItemCustomRate,
  IRecurringServiceCustomRate,
  IServiceCustomRate,
  ISurchargeCustomRate,
  IThresholdCustomRate,
} from '@root/modules/pricing/CustomRate/types';
import { IRecurringLineItemBillingCycleRate } from '@root/modules/pricing/GeneralRate/types';
import {
  type IEntity,
  type ILineItem,
  type ILineItemBillingCycleRate,
  type ThresholdType,
} from '@root/types';

import { type FormikPriceGroupRate, type PriceGroupRateType } from './types';

type FormikToPriceGroupRateType =
  | IServiceCustomRate
  | IRecurringServiceCustomRate
  | ILineItemCustomRate
  | IRecurringLineItemCustomRate
  | ISurchargeCustomRate
  | IThresholdCustomRate
  | IFutureCustomRate;

export const mapFormikToPriceGroupRate = <T>(
  formValues: FormikPriceGroupRate<T | FormikToPriceGroupRateType>,
) => {
  let price: number | undefined;
  let value: number | undefined;

  if (formValues.value && formValues.operation !== undefined) {
    value = +formValues.value * (formValues.operation ? 1 : -1);
  }

  if (formValues.price && formValues.finalPrice) {
    price = +(formValues.price * (1 + +(value ?? 0) / 100)).toFixed(2);
  }

  formValues.finalPrice = null;
  formValues.operation = undefined;
  formValues.value = undefined;
  formValues.displayValue = undefined;
  formValues.globalLimit = undefined;

  return {
    ...formValues,
    price: price ?? 0,
  };
};

export const mapPriceGroupRateServiceToFormik = <
  T extends
    | IServiceCustomRate
    | IRecurringServiceCustomRate
    | ILineItemCustomRate
    | IRecurringLineItemCustomRate
    | ISurchargeCustomRate
    | IThresholdCustomRate,
>(
  service: T,
  globalPrice: number | null,
  globalLimit?: number,
): T & Partial<IEntity> => {
  let displayValue: number | undefined;
  let value: number | undefined;
  let operation;

  if (service.price && globalPrice) {
    value = (100 * (+service.price - globalPrice)) / globalPrice || undefined;
  }

  // TODO: fix it after price refactoring would be done
  const threshold = service as unknown as IThresholdCustomRate;

  if (threshold?.limit === 0) {
    threshold.limit = undefined;
  }

  if (value) {
    operation = value > 0;
    value = Math.abs(+value);

    displayValue = +value.toFixed(3);
  }

  return {
    ...service,
    price: globalPrice,
    value: value?.toString(),
    finalPrice: service.price ? service.price.toString() : null,
    displayValue: displayValue?.toString(),
    operation,
    globalLimit,
  };
};

export const mapPriceGroupRateBillingCycleToFormik = (
  recurringLineItem: ILineItem,
  globalBillingCyclePrices?: IRecurringLineItemBillingCycleRate[],
  customBillingCyclePrices?: IRecurringLineItemBillingCycleRate[],
): ILineItemBillingCycleRate[] => {
  return (recurringLineItem.billingCycles as BillingCycleEnum[]).map(billingCycle => {
    const customBillingCyclePrice = customBillingCyclePrices?.find(
      customCyclePrice => customCyclePrice.billingCycle === billingCycle,
    );
    const globalBillingCyclePrice = globalBillingCyclePrices?.find(
      globalCyclePrice => globalCyclePrice.billingCycle === billingCycle,
    );

    let displayValue: number | undefined;
    let value: number | undefined;
    let operation;

    if (customBillingCyclePrice?.price && globalBillingCyclePrice?.price) {
      value =
        (100 * (+customBillingCyclePrice.price - globalBillingCyclePrice?.price)) /
          globalBillingCyclePrice.price || undefined;
    }

    if (value) {
      operation = +value > 0;
      value = Math.abs(+value);

      displayValue = +(+value).toFixed(3);
    }

    return {
      billingCycle,
      price: globalBillingCyclePrice?.price,
      value: value?.toString(),
      finalPrice: (customBillingCyclePrice ?? globalBillingCyclePrice)?.price?.toString(),
      displayValue: displayValue?.toString(),
      operation,
      nextPrice: customBillingCyclePrice?.nextPrice ?? undefined,
      effectiveDate: customBillingCyclePrice?.effectiveDate,
    };
  });
};

const greaterThanZeroValidationMessage = i18next.t('ValidationErrors.PriceGreaterThanZero');
const requiredValidationMessage = i18next.t('ValidationErrors.PriceIsRequired');
const numericValidationMessage = i18next.t('ValidationErrors.PriceMustBeANumber');
const incorrectFormatValidationMessage = i18next.t('ValidationErrors.PriceIncorrectFormat');

export const getPriceGroupRatesValidationSchema = (
  selectedTab: RatesEntityType,
  thresholdType?: ThresholdType,
) => {
  const validationSchemas = {
    oneTimeService: Yup.object().shape({
      bulkEnabled: Yup.boolean(),
      bulkValue: Yup.number().when('bulkEnabled', {
        is: true,
        then: Yup.number().typeError(numericValidationMessage).required(requiredValidationMessage),
      }),
      oneTimeService: Yup.array().of(
        Yup.object().shape({
          value: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage),
          finalPrice: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage)
            .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
    recurringService: Yup.object().shape({
      bulkEnabled: Yup.boolean(),
      bulkValue: Yup.number().when('bulkEnabled', {
        is: true,
        then: Yup.number().typeError(numericValidationMessage).required(requiredValidationMessage),
      }),
      recurringService: Yup.array().of(
        Yup.object().shape({
          frequencies: Yup.array().of(
            Yup.object().shape({
              value: Yup.number()
                .typeError(numericValidationMessage)
                .min(0, greaterThanZeroValidationMessage),
              finalPrice: Yup.number()
                .typeError(numericValidationMessage)
                .min(0, greaterThanZeroValidationMessage)
                .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
            }),
          ),
          value: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage),
          finalPrice: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage)
            .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
    oneTimeLineItem: Yup.object().shape({
      bulkEnabled: Yup.boolean(),
      bulkValue: Yup.number().when('bulkEnabled', {
        is: true,
        then: Yup.number().typeError(numericValidationMessage).required(requiredValidationMessage),
      }),
      oneTimeLineItem: Yup.array().of(
        Yup.object().shape({
          value: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage),
          finalPrice: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage)
            .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
    surcharge: Yup.object().shape({
      surcharge: Yup.array().of(
        Yup.object().shape({
          value: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage),
          finalPrice: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage)
            .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
    recurringLineItem: Yup.object().shape({
      bulkEnabled: Yup.boolean(),
      bulkValue: Yup.number().when('bulkEnabled', {
        is: true,
        then: Yup.number().typeError(numericValidationMessage).required(requiredValidationMessage),
      }),
      recurringLineItem: Yup.array().of(
        Yup.object().shape({
          billingCycles: Yup.array().of(
            Yup.object().shape({
              value: Yup.number()
                .typeError(numericValidationMessage)
                .min(0, greaterThanZeroValidationMessage),
              finalPrice: Yup.number()
                .typeError(numericValidationMessage)
                .min(0, greaterThanZeroValidationMessage)
                .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
            }),
          ),
          value: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage),
          finalPrice: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage)
            .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
    threshold: Yup.object().shape({
      threshold: Yup.array().of(
        Yup.object().shape({
          limit: Yup.number()
            .typeError(numericValidationMessage)
            .positive(greaterThanZeroValidationMessage)
            .test('integer', i18next.t('ValidationErrors.MustBeInteger'), val => {
              if (
                (thresholdType === 'demurrage' || thresholdType === 'usageDays') &&
                val &&
                !Number.isInteger(val)
              ) {
                return false;
              }

              return true;
            }),
          value: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage),
          finalPrice: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage)
            .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
  };

  return validationSchemas[selectedTab];
};

const defaultValues = {
  oneTimeService: null,
  recurringService: null,
  oneTimeLineItem: null,
  recurringLineItem: null,
  surcharge: null,
  threshold: null,
};

export const getPriceGroupRateDefaultValues = (
  selectedTab: RatesEntityType,
  item?: PriceGroupRateType[],
): Record<string, PriceGroupRateType[] | null> => ({
  [selectedTab]: item ?? defaultValues[selectedTab],
});
