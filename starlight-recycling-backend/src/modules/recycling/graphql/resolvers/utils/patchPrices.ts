import { keyBy, get } from 'lodash';
import {
  PriceInput,
  PriceBasedOnMaterialsInput,
  Price,
  BasedOnMaterialsPrices,
} from '../../types/Prices';

export const patchPrices = (
  pricePatch: PriceInput[],
  currentPrices: Price[],
  globalRackRatesPrices: Price[],
): Price[] => {
  const currentPricesIndexed = keyBy(currentPrices, 'id');
  const patchPricesIndexed = keyBy(pricePatch, 'id');
  const globalPricesIndexed = keyBy(globalRackRatesPrices, 'id');
  const nextPrices: Price[] = [];

  // go through requested patches
  Object.keys(patchPricesIndexed).forEach((itemId) => {
    const nextPrice = patchPricesIndexed[itemId].price;
    const globalPrice = get(globalPricesIndexed, itemId)?.price;

    if (nextPrice === globalPrice) {
      return;
    }

    nextPrices.push(patchPricesIndexed[itemId]);
  });

  // keep existing prices, that are not touched by patch
  Object.keys(currentPricesIndexed)
    .filter((itemId) => !patchPricesIndexed[itemId])
    .forEach((itemId) => {
      nextPrices.push(currentPricesIndexed[itemId]);
    });

  return nextPrices;
};

export const patchPriceBasedOnMaterials = (
  pricePatch: PriceBasedOnMaterialsInput[],
  currentPrices: BasedOnMaterialsPrices[],
  globalRackRatesPrices: BasedOnMaterialsPrices[],
): BasedOnMaterialsPrices[] => {
  const nextBasedOnMaterialsPrices: BasedOnMaterialsPrices[] = [];
  const currentPricesIndexed = keyBy(currentPrices, 'id');
  const patchPricesIndexed = keyBy(pricePatch, 'id');
  const globalPricesIndexed = keyBy(globalRackRatesPrices, 'id');

  // go through requested patches
  Object.keys(patchPricesIndexed).forEach((itemId) => {
    const nextPrices = patchPricesIndexed[itemId].prices;
    const currentPrices = get(currentPricesIndexed, itemId)?.prices || [];
    const globalPrices = get(globalPricesIndexed, itemId)?.prices || [];

    const patchedPrices = patchPrices(nextPrices, currentPrices, globalPrices);

    if (patchedPrices.length === 0) {
      return;
    }

    nextBasedOnMaterialsPrices.push({
      ...patchPricesIndexed[itemId],
      prices: patchedPrices,
    });
  });

  // keep existing prices, that are not touched by patch
  Object.keys(currentPricesIndexed)
    .filter((itemId) => !patchPricesIndexed[itemId])
    .forEach((itemId) => {
      nextBasedOnMaterialsPrices.push(currentPricesIndexed[itemId]);
    });

  return nextBasedOnMaterialsPrices;
};
