import { IBusinessContextIds } from '@root/types';

import { IGeneralRatePayload } from './api/types';
import { IServiceGeneralRate } from './types';

export const sanitizeServiceRates = (rates: IServiceGeneralRate[]): IServiceGeneralRate[] =>
  rates.map(rate => ({ ...rate, materialId: rate.materialId ?? null }));

export const sanitizeRates = (
  rates: Partial<IGeneralRatePayload> & IBusinessContextIds,
): IGeneralRatePayload & IBusinessContextIds => ({
  ...rates,
  oneTimeService: rates.oneTimeService ?? null,
  recurringService: rates.recurringService ?? null,
  oneTimeLineItem: rates.oneTimeLineItem ?? null,
  recurringLineItem: rates.recurringLineItem ?? null,
  surcharge: rates.surcharge ?? null,
  threshold: rates.threshold ?? null,
});

export const toFixed = (val: number, fraction = 2) => parseFloat(val.toFixed(fraction)).toString();

export const calculateFinalPrice = (operation: boolean, value: number, price: number) => {
  if (!operation) {
    value = -value;
  }

  return toFixed(price * (1 + value / 100));
};

export const calculatePercentage = (globalPrice: number, price: number) => {
  if (globalPrice) {
    if (globalPrice === price) {
      return undefined;
    }
    const percentage = 100 - (price / globalPrice) * 100;
    const percentageFactor = price < globalPrice ? 1 : -1;

    return (percentage * percentageFactor).toString();
  }

  return undefined;
};
