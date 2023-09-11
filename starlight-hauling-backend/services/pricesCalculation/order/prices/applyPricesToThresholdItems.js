import getPriceGroupPrices from '../common/getPriceGroupPrices.js';
import getPriceForBillableItem from '../common/getPriceForBillableItem/getPriceForBillableItem.js';

import { mathRound2 } from '../../../../utils/math.js';

import { PRICE_ENTITY_TYPE_CAMEL_CASE } from '../../../../consts/priceEntityTypes.js';
import { THRESHOLD_SETTING } from '../../../../consts/thresholdSettings.js';

const applyPricesToThresholdItems = async (
  ctx,
  { thresholdItems = [], ...params },
  { pricesRepo },
  trx,
) => {
  ctx.logger.debug(`applyPricesToThresholdItems->params: ${JSON.stringify(params, null, 2)}`);
  const { date, businessUnitId, businessLineId, priceGroupId } = params;
  const thresholdPrices = await getPriceGroupPrices(
    ctx,
    {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.threshold,
      date,
      businessUnitId,
      businessLineId,
      priceGroupId,
    },
    { pricesRepo },
    trx,
  );
  ctx.logger.debug(
    `applyPricesToThresholdItems->thresholdPrices: ${JSON.stringify(thresholdPrices, null, 2)}`,
  );

  return thresholdItems.map(({ needRecalculatePrice, ...threshold }) => {
    ctx.logger.debug(`applyPricesToThresholdItems->needRecalculatePrice: ${needRecalculatePrice}`);
    ctx.logger.debug(
      `applyPricesToThresholdItems->threshold: ${JSON.stringify(threshold, null, 2)}`,
    );
    const {
      thresholdId,
      thresholdItemId,
      equipmentItemId,
      materialId,
      price,
      priceId,
      quantity,
      setting,
      isNetQuantity = true,
    } = threshold;
    let calculatedPrice = price;
    let calculatedPriceId = priceId;
    let limit = 0;

    if (!Number.isSafeInteger(price) || (thresholdItemId && needRecalculatePrice)) {
      const conditions = {
        entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.threshold,
        materialId: [THRESHOLD_SETTING.canSizeAndMaterial, THRESHOLD_SETTING.material].includes(
          setting,
        )
          ? materialId
          : null,
        equipmentItemId: [THRESHOLD_SETTING.canSizeAndMaterial, THRESHOLD_SETTING.canSize].includes(
          setting,
        )
          ? equipmentItemId
          : null,
        thresholdId,
      };
      ctx.logger.debug(
        `applyPricesToThresholdItems->conditions: ${JSON.stringify(conditions, null, 2)}`,
      );

      const thresholdPrice = getPriceForBillableItem(conditions, thresholdPrices) ?? {};
      ctx.logger.debug(
        `applyPricesToThresholdItems->thresholdPrice: ${JSON.stringify(thresholdPrice, null, 2)}`,
      );

      ({ price: calculatedPrice = null, id: calculatedPriceId = null, limit = 0 } = thresholdPrice);
    }

    const netQuantity = isNetQuantity ? quantity : mathRound2(Math.max(quantity - limit, 0));
    return {
      ...threshold,
      priceId: calculatedPriceId,
      price: calculatedPrice,
      total: !Number.isSafeInteger(calculatedPrice)
        ? null
        : Math.trunc(calculatedPrice * netQuantity),
      quantity: netQuantity,
    };
  });
};

export default applyPricesToThresholdItems;
