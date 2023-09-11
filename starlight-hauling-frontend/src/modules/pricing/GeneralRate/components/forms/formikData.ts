import i18next from 'i18next';
import * as Yup from 'yup';

import { priceValidator } from '@root/helpers';
import { RatesEntityType } from '@root/modules/pricing/const';
import { type Maybe, type ThresholdType } from '@root/types';

import { IGeneralRatePayload } from '../../api/types';

import { GeneralRateType } from './types';

const greaterThanZeroValidationMessage = i18next.t('ValidationErrors.PriceGreaterThanZero');
const requiredValidationMessage = i18next.t('ValidationErrors.PriceIsRequired');
const numericValidationMessage = i18next.t('ValidationErrors.PriceMustBeANumber');
const incorrectFormatValidationMessage = i18next.t('ValidationErrors.PriceIncorrectFormat');

export const getGeneralRateValidationSchema = (
  selectedTab: RatesEntityType,
  isRecyclingLoB: boolean,
  thresholdType?: ThresholdType,
) => {
  const labelKey = isRecyclingLoB ? 'MinimalWeight' : 'Limit';

  const limitNumberMessage = i18next.t(`ValidationErrors.${labelKey}MustBeNumber`);
  const limitPositiveMessage = i18next.t(`ValidationErrors.${labelKey}MustBePositive`);
  const limitIntegerMessage = i18next.t(`ValidationErrors.${labelKey}MustBeInteger`);
  const limitRequiredMessage = i18next.t(`ValidationErrors.${labelKey}MustBeRequired`);

  const validationSchemas = {
    oneTimeService: Yup.object().shape({
      oneTimeService: Yup.array().of(
        Yup.object().shape({
          price: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage)
            .test('price', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
    recurringService: Yup.object().shape({
      recurringService: Yup.array().of(
        Yup.object().shape({
          frequencies: Yup.array().of(
            Yup.object().shape({
              price: Yup.number()
                .nullable()
                .typeError(numericValidationMessage)
                .min(0, greaterThanZeroValidationMessage)
                .test('price', incorrectFormatValidationMessage, priceValidator),
            }),
          ),
        }),
      ),
    }),
    oneTimeLineItem: Yup.object().shape({
      oneTimeLineItem: Yup.array().of(
        Yup.object().shape({
          price: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage)
            .test('price', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
    surcharge: Yup.object().shape({
      surcharge: Yup.array().of(
        Yup.object().shape({
          price: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage)
            .test('price', incorrectFormatValidationMessage, priceValidator),
        }),
      ),
    }),
    recurringLineItem: Yup.object().shape({
      recurringLineItem: Yup.array().of(
        Yup.object().shape({
          billingCycles: Yup.array().of(
            Yup.object().shape({
              price: Yup.number()
                .nullable()
                .typeError(numericValidationMessage)
                .min(0, greaterThanZeroValidationMessage)
                .test('price', incorrectFormatValidationMessage, priceValidator),
            }),
          ),
        }),
      ),
    }),
    threshold: Yup.object().shape({
      threshold: Yup.array().of(
        Yup.object().shape({
          price: Yup.number()
            .typeError(numericValidationMessage)
            .min(0, greaterThanZeroValidationMessage)
            .test('price', incorrectFormatValidationMessage, priceValidator)
            // eslint-disable-next-line func-names
            .test('required', requiredValidationMessage, function (val?: Maybe<number>) {
              if (!val && val !== 0 && this.parent.limit) {
                return false;
              }

              return true;
            }),
          limit: Yup.number()
            .typeError(limitNumberMessage)
            .positive(limitPositiveMessage)
            .when('price', {
              is: val => !!val,
              then: Yup.number()
                .required(limitRequiredMessage)
                .typeError(limitNumberMessage)
                .positive(limitPositiveMessage),
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

const defaultValues: IGeneralRatePayload = {
  oneTimeService: [],
  recurringService: [],
  oneTimeLineItem: [],
  recurringLineItem: [],
  threshold: [],
  surcharge: [],
};

export const getGeneralRateValues = (
  selectedTab: RatesEntityType,
  item?: GeneralRateType[],
): Record<string, GeneralRateType[] | null> => ({
  [selectedTab]: item ?? defaultValues[selectedTab],
});
