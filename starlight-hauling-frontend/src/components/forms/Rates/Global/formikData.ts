import i18next from 'i18next';
import * as Yup from 'yup';

import { priceValidator } from '@root/helpers';
import { type Maybe, type ThresholdType } from '@root/types';

import { type RatesConfigType } from '../types';

import { type GlobalRateType } from './types';

const I18N_PATH = 'components.forms.Rates.Global.Form.';

const priceNumberMessage = i18next.t(`${I18N_PATH}PriceMustBeNumber`);
const pricePositiveMessage = i18next.t(`${I18N_PATH}PriceMustBePositive`);
const priceRequiredMessage = i18next.t(`${I18N_PATH}PriceMustBeRequired`);
const incorrectPrice = i18next.t(`${I18N_PATH}IncorrectPrice`);

const numericValidationMessage = i18next.t(`${I18N_PATH}MustBeNumber`);
const positiveValidationMessage = i18next.t(`${I18N_PATH}MustBePositive`);
const incorrectFormatValidationMessage = i18next.t(`${I18N_PATH}IncorrectFormat`);

export const getGlobalRateValidationSchema = (
  selectedTab: RatesConfigType,
  isRecyclingLoB: boolean,
  thresholdType?: ThresholdType,
) => {
  const labelKey = isRecyclingLoB ? 'MinimalWeight' : 'Limit';
  const limitNumberMessage = i18next.t(`${I18N_PATH}${labelKey}MustBeNumber`);
  const limitPositiveMessage = i18next.t(`${I18N_PATH}${labelKey}MustBePositive`);
  const limitIntegerMessage = i18next.t(`${I18N_PATH}${labelKey}MustBeInteger`);
  const limitRequiredMessage = i18next.t(`${I18N_PATH}${labelKey}MustBeRequired`);

  const validationSchemas = {
    services: Yup.object().shape({
      services: Yup.array().of(
        Yup.object().shape({
          price: Yup.number()
            .typeError(priceNumberMessage)
            .min(0, pricePositiveMessage)
            .test('price', incorrectPrice, priceValidator),
        }),
      ),
    }),
    recurringServices: Yup.object().shape({
      recurringServices: Yup.array().of(
        Yup.object().shape({
          frequencies: Yup.array().of(
            Yup.object().shape({
              price: Yup.number()
                .nullable()
                .typeError(priceNumberMessage)
                .min(0, pricePositiveMessage)
                .test('price', incorrectPrice, priceValidator),
            }),
          ),
        }),
      ),
    }),
    lineItems: Yup.object().shape({
      lineItems: Yup.array().of(
        Yup.object().shape({
          price: Yup.number()
            .typeError(priceNumberMessage)
            .min(0, pricePositiveMessage)
            .test('price', incorrectPrice, priceValidator),
        }),
      ),
    }),
    surcharges: Yup.object().shape({
      surcharges: Yup.array().of(
        Yup.object().shape({
          price: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, positiveValidationMessage)
            .test('price', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
    recurringLineItems: Yup.object().shape({
      recurringLineItems: Yup.array().of(
        Yup.object().shape({
          billingCycles: Yup.array().of(
            Yup.object().shape({
              price: Yup.number()
                .nullable()
                .typeError(priceNumberMessage)
                .min(0, pricePositiveMessage)
                .test('price', incorrectPrice, priceValidator),
            }),
          ),
        }),
      ),
    }),
    thresholds: Yup.object().shape({
      thresholds: Yup.array().of(
        Yup.object().shape({
          price: Yup.number()
            .typeError(priceNumberMessage)
            .min(0, pricePositiveMessage)
            .test('price', incorrectPrice, priceValidator)
            .test('required', priceRequiredMessage, function (val?: Maybe<number>) {
              if (!val && val !== 0 && this.parent.limit) {
                return false;
              }

              return true;
            }),
          limit: Yup.number()
            .typeError(limitNumberMessage)
            .min(0, limitPositiveMessage)
            .when('price', {
              is: val => !!val,
              then: Yup.number()
                .required(limitRequiredMessage)
                .typeError(limitNumberMessage)
                .min(0, limitPositiveMessage),
            })
            .test('integer', limitIntegerMessage, (val?: Maybe<number>) => {
              if (
                val &&
                (thresholdType === 'demurrage' || thresholdType === 'usageDays') &&
                !Number.isInteger(val)
              ) {
                return false;
              }

              return true;
            }),
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

export const getGlobalRateValues = (
  selectedTab: RatesConfigType,
  item?: GlobalRateType[],
): Record<string, GlobalRateType[]> => ({
  [selectedTab]: item ?? defaultValues[selectedTab],
});
