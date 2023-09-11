import {
  IGlobalRateLineItem,
  IGlobalRateLineItemForm,
  IGlobalRateRecurringService,
  IGlobalRateService,
  IGlobalRateServiceForm,
  IGlobalRateSurcharge,
  IGlobalRateSurchargeForm,
  IGlobalRateThreshold,
  IGlobalRateThresholdForm,
} from '@root/types';

export type GlobalRateType =
  | IGlobalRateService
  | IGlobalRateLineItem
  | IGlobalRateThreshold
  | IGlobalRateSurcharge
  | IGlobalRateRecurringService;

export type GlobalRateTypeForm =
  | IGlobalRateServiceForm
  | IGlobalRateLineItemForm
  | IGlobalRateThresholdForm
  | IGlobalRateSurchargeForm;
