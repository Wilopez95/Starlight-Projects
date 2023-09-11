import { BATCH_RATES_SOURCE } from '../../../../consts/batchRates.js';
import calculateRateValue from './calculateRateValue.js';
import getOldPrice from './getOldPrice.js';
import getPriceSequence from './getPriceSequence.js';

const calculatePrices = ({
  priceGroupsIds,
  oldPrices,
  generalPrices,
  effectiveDate,
  calculation,
  value,
  source,
}) => {
  const { currentPrices, nextPrices } = generalPrices.reduce(
    (acc, generalPrice) => {
      const isCurrentTarget = source === BATCH_RATES_SOURCE.current;

      const oldPrice = getOldPrice(oldPrices, generalPrice);
      const basePrice = isCurrentTarget ? oldPrice?.price : generalPrice.price;

      const nextPrice = calculateRateValue({
        basePrice,
        calculation,
        value,
        source,
      });

      if (!nextPrice) {
        return acc;
      }

      const { current, next } = getPriceSequence({
        nextPrice,
        effectiveDate,
        oldPrice,
        generalPrice,
        priceGroupsIds,
        isCurrentTarget,
        basePrice,
      });

      acc.currentPrices.push(...current);
      acc.nextPrices.push(...next);

      return acc;
    },
    { currentPrices: [], nextPrices: [] },
  );

  return { currentPrices, nextPrices };
};

export default calculatePrices;
