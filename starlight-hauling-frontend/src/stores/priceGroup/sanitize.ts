import { type IPriceGroupRateService } from '@root/types';

export const sanitizeServiceRates = (rates: IPriceGroupRateService[]): IPriceGroupRateService[] =>
  rates.map(rate => ({ ...rate, materialId: rate.materialId ?? null }));
