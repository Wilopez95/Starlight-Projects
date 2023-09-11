import i18next from 'i18next';
import * as Yup from 'yup';

import { BillingCycleEnum } from '@root/consts';
import { priceValidator } from '@root/helpers';
import {
  type IFuturePrice,
  type ILineItem,
  type ILineItemBillingCycleRate,
  type IPriceGroupRateLineItem,
  type IPriceGroupRateRecurringLineItem,
  type IPriceGroupRateRecurringService,
  type IPriceGroupRateService,
  type IPriceGroupRateSurcharge,
  type IPriceGroupRateThreshold,
  type ThresholdType,
} from '@root/types';

import { RatesConfigType } from '../types';

import { type FormikPriceGroupRate, type PriceGroupRateType } from './types';

export const mapFormikToPriceGroupRate = <
  T extends
    | IPriceGroupRateService
    | IPriceGroupRateLineItem
    | IPriceGroupRateRecurringLineItem
    | IPriceGroupRateThreshold
    | IPriceGroupRateRecurringService
    | IPriceGroupRateSurcharge
    | IFuturePrice,
>(
  formValues: FormikPriceGroupRate<T>,
) => {
  let price: number | undefined;
  let value: number | undefined;

  if (formValues.value && formValues.operation !== undefined) {
    value = +formValues.value * (formValues.operation ? 1 : -1);
  }

  if (formValues.finalPrice) {
    price = +formValues.finalPrice;

    if (formValues.price) {
      price = +formValues.finalPrice
        ? +(+formValues.price * (1 + +(value ?? 0) / 100)).toFixed(2)
        : 0;
    }
  }

  return {
    ...formValues,
    finalPrice: undefined,
    value: undefined,
    operation: undefined,
    displayValue: undefined,
    globalLimit: undefined,
    price,
  };
};

export const mapPriceGroupRateServiceToFormik = <
  T extends
    | IPriceGroupRateService
    | IPriceGroupRateLineItem
    | IPriceGroupRateRecurringLineItem
    | IPriceGroupRateThreshold
    | IPriceGroupRateRecurringService
    | IPriceGroupRateSurcharge,
>(
  service: T,
  globalPrice?: number,
  globalLimit?: number,
): FormikPriceGroupRate<T> => {
  let displayValue: number | undefined;
  let value: number | undefined;
  let operation;

  if (service.price && globalPrice) {
    value = (100 * (+service.price - globalPrice)) / globalPrice || undefined;
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
    finalPrice: service.price?.toFixed(2),
    displayValue: displayValue?.toString(),
    operation,
    globalLimit,
  };
};

export const mapPriceGroupRateBillingCycleToFormik = (
  recurringLineItem: ILineItem,
  globalBillingCyclePrices?: ILineItemBillingCycleRate[],
  customBillingCyclePrices?: ILineItemBillingCycleRate[],
): ILineItemBillingCycleRate[] =>
  (recurringLineItem.billingCycles as BillingCycleEnum[]).map(billingCycle => {
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
        /* eslint-disable */
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
      finalPrice: (customBillingCyclePrice ?? globalBillingCyclePrice)?.price?.toFixed(2),
      displayValue: displayValue?.toString(),
      operation,
      nextPrice: customBillingCyclePrice?.nextPrice,
      effectiveDate: customBillingCyclePrice?.effectiveDate,
    };
  });

const I18N_PATH = 'components.forms.Rates.Custom.Form.';

const numericValidationMessage = i18next.t(`${I18N_PATH}MustBeNumber`);
const positiveValidationMessage = i18next.t(`${I18N_PATH}MustBePositive`);
const requiredValidationMessage = i18next.t(`${I18N_PATH}MustBeRequired`);
const integerValidationMessage = i18next.t(`${I18N_PATH}MustBeInteger`);
const incorrectFormatValidationMessage = i18next.t(`${I18N_PATH}IncorrectFormat`);

export const getPriceGroupRatesValidationSchema = (
  selectedTab: RatesConfigType,
  thresholdType?: ThresholdType,
) => {
  const validationSchemas = {
    services: Yup.object().shape({
      bulkEnabled: Yup.boolean(),
      bulkValue: Yup.number().when('bulkEnabled', {
        is: true,
        then: Yup.number().typeError(numericValidationMessage).required(requiredValidationMessage),
      }),
      services: Yup.array().of(
        Yup.object().shape({
          value: Yup.number().typeError(numericValidationMessage).min(0, positiveValidationMessage),
          finalPrice: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, positiveValidationMessage)
            .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
    recurringServices: Yup.object().shape({
      bulkEnabled: Yup.boolean(),
      bulkValue: Yup.number().when('bulkEnabled', {
        is: true,
        then: Yup.number().typeError(numericValidationMessage).required(requiredValidationMessage),
      }),
      recurringServices: Yup.array().of(
        Yup.object().shape({
          frequencies: Yup.array().of(
            Yup.object().shape({
              value: Yup.number()
                .typeError(numericValidationMessage)
                .min(0, positiveValidationMessage),
              finalPrice: Yup.number()
                .typeError(numericValidationMessage)
                .min(0, positiveValidationMessage)
                .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
            }),
          ),
          value: Yup.number().typeError(numericValidationMessage).min(0, positiveValidationMessage),
          finalPrice: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, positiveValidationMessage)
            .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
    lineItems: Yup.object().shape({
      bulkEnabled: Yup.boolean(),
      bulkValue: Yup.number().when('bulkEnabled', {
        is: true,
        then: Yup.number().typeError(numericValidationMessage).required(requiredValidationMessage),
      }),
      lineItems: Yup.array().of(
        Yup.object().shape({
          value: Yup.number().typeError(numericValidationMessage).min(0, positiveValidationMessage),
          finalPrice: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, positiveValidationMessage)
            .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
    surcharges: Yup.object().shape({
      surcharges: Yup.array().of(
        Yup.object().shape({
          value: Yup.number().typeError(numericValidationMessage).min(0, positiveValidationMessage),
          finalPrice: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, positiveValidationMessage)
            .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
    recurringLineItems: Yup.object().shape({
      bulkEnabled: Yup.boolean(),
      bulkValue: Yup.number().when('bulkEnabled', {
        is: true,
        then: Yup.number().typeError(numericValidationMessage).required(requiredValidationMessage),
      }),
      recurringLineItems: Yup.array().of(
        Yup.object().shape({
          billingCycles: Yup.array().of(
            Yup.object().shape({
              value: Yup.number()
                .typeError(numericValidationMessage)
                .min(0, positiveValidationMessage),
              finalPrice: Yup.number()
                .typeError(numericValidationMessage)
                .min(0, positiveValidationMessage)
                .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
            }),
          ),
          value: Yup.number().typeError(numericValidationMessage).min(0, positiveValidationMessage),
          finalPrice: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, positiveValidationMessage)
            .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
    thresholds: Yup.object().shape({
      thresholds: Yup.array().of(
        Yup.object().shape({
          limit: Yup.number()
            .typeError(numericValidationMessage)
            .test(
              'integer',
              integerValidationMessage,
              val =>
                !(
                  (thresholdType === 'demurrage' || thresholdType === 'usageDays') &&
                  val &&
                  !Number.isInteger(val)
                ),
            )
            .test(
              'moreThanZero',
              positiveValidationMessage,
              val => typeof val === 'number' && val >= 0,
            ),
          value: Yup.number().typeError(numericValidationMessage).min(0, positiveValidationMessage),
          finalPrice: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, positiveValidationMessage)
            .test('finalPrice', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
  };

  return validationSchemas[selectedTab];
};

const defaultValues = {
  services: [],
  recurringServices: [],
  lineItems: [],
  recurringLineItems: [],
  thresholds: [],
  surcharges: [],
};

export const getPriceGroupRateDefaultValues = (
  selectedTab: RatesConfigType,
  item?: PriceGroupRateType[],
): Record<string, PriceGroupRateType[]> => ({
  [selectedTab]: item || defaultValues[selectedTab],
});
