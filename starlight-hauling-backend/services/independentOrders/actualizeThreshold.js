import PricesRepo from '../../repos/prices.js';

import getPricesForThresholds from '../pricesCalculation/order/prices/getPricesForThresholds.js';

const actualizeThreshold = async (ctx, params, trx) => {
  ctx.logger.debug(`actualizeThreshold->params: ${JSON.stringify(params, null, 2)}`);

  const {
    orderId,
    existingThresholds,
    businessUnitId,
    businessLineId,
    priceGroupId,
    equipmentItemId,
    materialId,
    thresholdId,
    setting,
    currentValue,
    date,
    threshold: { applySurcharges, type },
  } = params;

  try {
    const [{ priceId, price, quantity }] = await getPricesForThresholds(
      ctx,
      {
        thresholds: [
          {
            thresholdItemId: null,
            price: null,
            priceId: null,
            quantity: currentValue,
            isNetQuantity: false,
            thresholdId,
            materialId,
            equipmentItemId,
            setting,
          },
        ],
        date,
        businessUnitId,
        businessLineId,
        priceGroupId,
      },
      { pricesRepo: PricesRepo },
      trx,
    );

    if (priceId && quantity) {
      const objToUpsert = {
        thresholdId,
        priceId,
        price,
        quantity,
        materialId,
        applySurcharges,
      };

      existingThresholds?.some(item => {
        if (item.threshold.type === type) {
          objToUpsert.id = item.id;
          return true;
        }
        return false;
      });

      return objToUpsert;
    }

    return null;
  } catch (error) {
    ctx.logger.error(error, `Error while actualizing threshold for an order with id ${orderId}`);
    throw error;
  }
};

export default actualizeThreshold;
