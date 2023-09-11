import { type IGlobalRateService } from '@root/types';

export const sanitizeServiceRates = (rates: IGlobalRateService[]): IGlobalRateService[] =>
  rates.map(rate => ({ ...rate, materialId: rate.materialId ?? null }));
