import { ThresholdItems } from '../database/entities/tenant/ThresholdItems';

export const calcPriceToDisplay = (data: ThresholdItems) => {
  const price = data.price || 0;
  const calc = Number(Math.round(price / 1000000).toFixed(2));
  data.priceToDisplay = calc;
  return data;
};
