import isNull from 'lodash/isNull.js';
import getPriceGroupPrices from '../common/getPriceGroupPrices.js';
import getPriceForBillableItem from '../common/getPriceForBillableItem/getPriceForBillableItem.js';

import { mathRound2 } from '../../../../utils/math.js';

import { PRICE_ENTITY_TYPE_CAMEL_CASE } from '../../../../consts/priceEntityTypes.js';
import { THRESHOLD_SETTING } from '../../../../consts/thresholdSettings.js';

const getPricesForThresholds = (
  ctx,
  { thresholds = [], date, businessUnitId, businessLineId, priceGroupId },
  { pricesRepo },
  trx,
) =>
  Promise.all(
    thresholds.map(
      async ({
        thresholdItemId,
        thresholdId,
        materialId,
        equipmentItemId,
        price,
        priceId,
        quantity,
        needRecalculatePrice,
        setting,
        isNetQuantity = true,
      }) => {
        let calculatedPrice = price;
        let limit = 0;
        let calculatedPriceId = priceId;

        if (isNull(price) || (thresholdItemId && needRecalculatePrice)) {
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

          const conditions = {
            entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.threshold,
            materialId: [THRESHOLD_SETTING.canSizeAndMaterial, THRESHOLD_SETTING.material].includes(
              setting,
            )
              ? materialId
              : null,
            equipmentItemId: [
              THRESHOLD_SETTING.canSizeAndMaterial,
              THRESHOLD_SETTING.canSize,
            ].includes(setting)
              ? equipmentItemId
              : null,
            thresholdId,
          };

          ({
            price: calculatedPrice = null,
            limit = 0,
            id: calculatedPriceId = null,
          } = getPriceForBillableItem(conditions, thresholdPrices) ?? {});
        }

        const netQuantity = isNetQuantity ? quantity : mathRound2(Math.max(quantity - limit, 0));

        return {
          price: calculatedPrice,
          priceId: calculatedPriceId,
          total: isNull(calculatedPrice) ? null : mathRound2(calculatedPrice * netQuantity),
          quantity: netQuantity,
        };
      },
    ),
  );

export default getPricesForThresholds;
