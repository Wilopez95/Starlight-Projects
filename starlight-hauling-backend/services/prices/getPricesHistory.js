import PricesRepo from '../../repos/prices.js';
import PriceGroupsRepo from '../../repos/priceGroups.js';

import { PRICE_ENTITY_TYPE } from '../../consts/priceEntityTypes.js';
import { EVENT_TYPE } from '../../consts/historicalEventType.js';

const findHistoricalChangesByFieldName = (result, field, prev, cur, index) => {
  if (index !== 0 && (prev[field] || cur[field]) && prev[field] !== cur[field]) {
    result.push({
      attribute: field,
      id: prev.id,
      newValue: prev[field],
      previousValue: cur[field] ?? null,
      timestamp: prev.createdAt,
      userId: prev.userId,
      user: prev.user,
    });
  }
};

const getPricesHistory = async (
  ctxState,
  { priceGroupId, businessUnitId, businessLineId, entityType, ...data } = {},
) => {
  const isCustomPriceGroupRatesUpdate = !!priceGroupId;
  if (!isCustomPriceGroupRatesUpdate) {
    const priceGroup = await PriceGroupsRepo.getInstance(ctxState).getBy({
      condition: {
        businessUnitId,
        businessLineId,
        isGeneral: true,
      },
      fields: ['id'],
    });

    // eslint-disable-next-line no-param-reassign
    priceGroupId = priceGroup.id;
  }

  const prices = await PricesRepo.getInstance(ctxState).getAllWithoutPlannedForBatchUpdate({
    condition: {
      priceGroupId,
      entityType: PRICE_ENTITY_TYPE[entityType],
      ...data,
    },
    orderBy: [{ column: 'startAt', order: 'desc' }],
    date: new Date(),
  });

  const priceGroupHistoricalRecords = await PriceGroupsRepo.getHistoricalInstance(ctxState).getAll({
    condition: {
      originalId: priceGroupId,
      // TODO: why edited only !?
      eventType: EVENT_TYPE.edited,
    },
    orderBy: [{ column: 'createdAt', order: 'desc' }],
  });

  const result = [];

  prices?.reduce((acc, cur, index) => {
    ['price', 'limit'].map(field =>
      findHistoricalChangesByFieldName(result, field, acc, cur, index),
    );

    return cur;
  }, {});

  priceGroupHistoricalRecords?.reduce((acc, cur, index) => {
    ['overweightSetting', 'usageDaysSetting', 'demurrageSetting', 'loadSetting', 'dumpSetting'].map(
      field => findHistoricalChangesByFieldName(result, field, acc, cur, index),
    );

    return cur;
  }, {});

  return result;
};

export default getPricesHistory;
