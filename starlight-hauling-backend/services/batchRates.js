import { mathRound2 } from '../utils/math.js';

import { BATCH_RATES_SOURCE, BATCH_RATES_CALCULATION } from '../consts/batchRates.js';

export const calculateRateValue = ({ globalPrice, currentRate, calculation, value, source }) => {
  let newPrice;
  // global rates case
  if (source === BATCH_RATES_SOURCE.global) {
    if (calculation === BATCH_RATES_CALCULATION.percentage) {
      newPrice = globalPrice * (1 + value / 100);
    } else {
      newPrice = globalPrice + value;
    }
  }
  // custom rates percentage case
  else if (calculation === BATCH_RATES_CALCULATION.percentage) {
    if (currentRate) {
      newPrice = currentRate * (1 + value / 100);
    } else {
      newPrice = globalPrice * (1 + value / 100);
    }
  }
  // custom rates flat case
  else {
    newPrice = (currentRate || 0) + value;
  }

  return newPrice <= 0 ? Number.NaN : mathRound2(newPrice);
};
