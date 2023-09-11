import getPriceGroupPrices from '../common/getPriceGroupPrices.js';
import getPriceForBillableItem from '../common/getPriceForBillableItem/getPriceForBillableItem.js';

import ApiError from '../../../../errors/ApiError.js';

import { PRICE_ENTITY_TYPE_CAMEL_CASE } from '../../../../consts/priceEntityTypes.js';
import { SURCHARGE_CALCULATION } from '../../../../consts/surcharges.js';

const applyPricesToSurchargeItems = async (
  ctx,
  { surcharges = [], ...params },
  { pricesRepo },
  trx,
) => {
  ctx.logger.debug(`applyPricesToSurchargeItems->params: ${JSON.stringify(params, null, 2)}`);
  ctx.logger.debug(
    `applyPricesToSurchargeItems->surcharges: ${JSON.stringify(surcharges, null, 2)}`,
  );
  const { date, businessUnitId, businessLineId, priceGroupId } = params;
  const surchargePrices = await getPriceGroupPrices(
    ctx,
    {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.surcharge,
      date,
      businessUnitId,
      businessLineId,
      priceGroupId,
    },
    { pricesRepo },
    trx,
  );
  ctx.logger.debug(
    `applyPricesToSurchargeItems->surchargePrices: ${JSON.stringify(surchargePrices, null, 2)}`,
  );

  return surcharges
    .map(
      ({
        id: surchargeId,
        needRecalculatePrice,
        billableItemTotal,
        calculation,
        materialBasedPricing,
        ...surcharge
      }) => {
        ctx.logger.debug(
          `applyPricesToSurchargeItems->surcharges.map->needRecalculatePrice: ${needRecalculatePrice}`,
        );
        ctx.logger.debug(
          `applyPricesToSurchargeItems->surcharges.map->surcharge: ${JSON.stringify(
            surcharge,
            null,
            2,
          )}`,
        );
        const { materialId, price, priceId } = surcharge;
        let calculatedPrice = price;
        let calculatedPriceId = priceId;

        if (!Number.isSafeInteger(price) || (surchargeId && needRecalculatePrice)) {
          const conditions = {
            entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.surcharge,
            materialId: materialBasedPricing ? materialId : null,
            surchargeId,
          };
          ctx.logger.debug(
            `applyPricesToSurchargeItems->surcharges.map->conditions: ${JSON.stringify(
              conditions,
              null,
              2,
            )}`,
          );

          const surchargePrice = getPriceForBillableItem(conditions, surchargePrices) ?? {};
          ctx.logger.debug(
            `applyPricesToSurchargeItems->surcharges.map->surchargePrice: ${JSON.stringify(
              surchargePrice,
              null,
              2,
            )}`,
          );

          ({ price: calculatedPrice = null, id: calculatedPriceId = null } = surchargePrice);
        }
        if (!calculatedPriceId) {
          return null;
        }

        switch (calculation) {
          case SURCHARGE_CALCULATION.percentage: {
            return {
              surchargeId,
              total: Number(billableItemTotal),
              priceId: calculatedPriceId,
              price: Number(calculatedPrice),
              amount: Math.ceil((Number(billableItemTotal) * Number(calculatedPrice)) / 100), // TODO: clarify rounding
            };
          }
          case SURCHARGE_CALCULATION.flat: {
            if (surcharge.billableLineItemId || surcharge.thresholdId) {
              return null;
            }
            return {
              ...surcharge,
              surchargeId,
              total: Number(billableItemTotal),
              priceId: calculatedPriceId,
              price: Number(calculatedPrice),
              amount: Number(calculatedPrice),
            };
          }
          default: {
            throw ApiError.badRequest(`Surcharge calculate type "${calculation}" isn't supported`);
          }
        }
      },
    )
    .filter(Boolean);
};

export default applyPricesToSurchargeItems;
