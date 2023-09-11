import { IBusinessContextIds } from '@root/types';

import { ICustomRatePayload } from './api/types';
import { IServiceCustomRate } from './types';

export const sanitizeServiceRates = (rates: IServiceCustomRate[]): IServiceCustomRate[] =>
  rates.map(rate => ({ ...rate, materialId: rate.materialId ?? null }));

export const sanitizeRatesPrice = <T>({ price, ...entity }: T & { price: number | null }) => ({
  ...entity,
  price: price ?? null,
});

export const sanitizeRates = (
  rates: Partial<ICustomRatePayload> & IBusinessContextIds & { id: number },
): ICustomRatePayload & IBusinessContextIds & { id: number } => ({
  ...rates,
  oneTimeService: rates.oneTimeService ? rates.oneTimeService.map(sanitizeRatesPrice) : null,
  recurringService: rates.recurringService ? rates.recurringService.map(sanitizeRatesPrice) : null,
  oneTimeLineItem: rates.oneTimeLineItem ? rates.oneTimeLineItem.map(sanitizeRatesPrice) : null,
  recurringLineItem: rates.recurringLineItem
    ? rates.recurringLineItem.map(sanitizeRatesPrice)
    : null,
  surcharge: rates.surcharge ? rates.surcharge.map(sanitizeRatesPrice) : null,
  threshold: rates.threshold ? rates.threshold.map(sanitizeRatesPrice) : null,
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
