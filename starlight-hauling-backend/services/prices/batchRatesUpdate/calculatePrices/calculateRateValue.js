import { BATCH_RATES_CALCULATION } from '../../../../consts/batchRates.js';

const formatPrice = price => (price < 0 ? Number.NaN : price);

const calculateRateValue = ({ basePrice, calculation, value }) => {
  const price = Number(basePrice) || 0;
  const priceChange = value * 1e6;
  if (calculation === BATCH_RATES_CALCULATION.percentage) {
    return formatPrice(price + (price * priceChange) / 100e6);
  }
  return formatPrice(price + priceChange);
};

export default calculateRateValue;
