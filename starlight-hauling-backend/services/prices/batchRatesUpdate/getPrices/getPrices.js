import isEmpty from 'lodash/isEmpty.js';
import { isFuture, isPast, isToday } from 'date-fns';

import PricesRepository from '../../../../repos/prices.js';

import ApiError from '../../../../errors/ApiError.js';

const getPrices = async (
  ctxState,
  {
    isPreview,
    entityType,
    servicesIds,
    materialIds,
    equipmentItemIds,
    lineItemIds,
    priceGroupsIds,
    includeNonMaterial,
    overridePrices,
    businessUnitId,
    businessLineId,
    today,
  },
  trx,
  { PricesRepo = PricesRepository },
) => {
  const condition = {
    entityType,
    servicesIds,
    materialIds,
    equipmentItemIds,
    lineItemIds,
    includeNonMaterial,
    today,
  };
  const prices = await PricesRepo.getInstance(ctxState).getAllForBatch(
    {
      condition,
      priceGroupCondition: {
        active: true,
        businessUnitId,
        businessLineId,
      },
      isPreview,
    },
    trx,
  );

  if (isEmpty(prices)) {
    throw ApiError.notFound(
      'No prices found',
      `No prices match such criteria ${JSON.stringify(condition)}`,
    );
  }

  const { oldPrices, nextOverriddenPrices, generalPrices } = prices.reduce(
    (acc, price) => {
      if (price.isGeneral) {
        acc.generalPrices.push(price);
        return acc;
      }

      const customPrice = priceGroupsIds.includes(price.priceGroupId);

      // TODO remove isToday when timezone implemented
      const pastOrToday = isPast(price.startAt) || isToday(price.startAt);

      const isCurrentPrice = customPrice && (price.nextPrice || pastOrToday);

      const isNextOverriddenPrice = customPrice && isFuture(price.startAt);

      if (isCurrentPrice) {
        acc.oldPrices.push(price);
        return acc;
      }

      if (isNextOverriddenPrice) {
        acc.nextOverriddenPrices.push(price);
      }

      return acc;
    },
    {
      oldPrices: [],
      nextOverriddenPrices: [],
      generalPrices: [],
    },
  );

  if (!isPreview && !overridePrices && nextOverriddenPrices.length) {
    throw ApiError.conflict({}, 'Price already overridden');
  }

  return { oldPrices, nextOverriddenPrices, generalPrices };
};

export default getPrices;
