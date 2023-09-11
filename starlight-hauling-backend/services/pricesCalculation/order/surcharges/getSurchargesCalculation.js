import isNull from 'lodash/isNull.js';

import getPriceForBillableItem from '../common/getPriceForBillableItem/getPriceForBillableItem.js';
import getPriceGroupPrices from '../common/getPriceGroupPrices.js';
import { PRICE_ENTITY_TYPE_CAMEL_CASE } from '../../../../consts/priceEntityTypes.js';
import { SURCHARGE_CALCULATION } from '../../../../consts/surcharges.js';
import getSurchargesCalculationForLineItems from './getSurchargesCalculationForLineItems.js';
import getSurchargesCalculationForThresholds from './getSurchargesCalculationForThresholds.js';

const getSurchargesCalculation = async (
  ctx,
  { orders, businessLineId, businessUnitId, ordersSurcharges = {} },
  { pricesRepo, surchargeRepo },
) => {
  const surcharges =
    (await surchargeRepo.getInstance(ctx.state).getAll({
      condition: { active: true, businessLineId },
    })) ?? [];
  ctx.logger.debug(`getSurchargesCalculation->surcharges: ${JSON.stringify(surcharges, null, 2)}`);

  const calculations = await Promise.all(
    orders.map(
      async ({
        priceGroupId,
        serviceDate,
        orderId,
        billableServiceId,
        materialId,
        price: total,
        needRecalculateSurcharges,
        applySurcharges,
        lineItems,
        thresholds,
        surcharges: existingSurcharges,
      }) => {
        ordersSurcharges[orderId] = []; // dirty temp fast solution to not duplicate requesting surcharges and getting prices for them
        let existingOrderPrices;
        let appliedSurcharges = [];

        if (orderId && !needRecalculateSurcharges) {
          return existingSurcharges ?? null;
        }

        if (!isNull(total) || (orderId && needRecalculateSurcharges)) {
          const priceGroupPrices = await getPriceGroupPrices(
            ctx,
            {
              businessUnitId,
              businessLineId,
              priceGroupId,
              date: serviceDate,
              entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.surcharge,
            },
            { pricesRepo },
          );
          ctx.logger.debug(
            `getSurchargesCalculation->priceGroupPrices: ${JSON.stringify(
              priceGroupPrices,
              null,
              2,
            )}`,
          );

          appliedSurcharges = surcharges.map(
            ({ id: surchargeId, materialBasedPricing, calculation }) => {
              const conditions = {
                entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.surcharge,
                materialId: materialBasedPricing ? materialId : null,
                surchargeId,
              };

              ctx.logger.debug(
                `getSurchargesCalculation->conditions: ${JSON.stringify(conditions, null, 2)}`,
              );
              const { id: surchargeRateId = null, price: surchargeRate = null } =
                getPriceForBillableItem(conditions, priceGroupPrices) ?? {};

              ctx.logger.debug(
                `getSurchargesCalculation->surchargeRateId: ${JSON.stringify(
                  surchargeRateId,
                  null,
                  2,
                )}`,
              );
              ctx.logger.debug(
                `getSurchargesCalculation->surchargeRate: ${JSON.stringify(
                  surchargeRate,
                  null,
                  2,
                )}`,
              );
              if (!surchargeRateId) {
                return null;
              }
              // dirty temp fast solution to not duplicate requesting surcharges and getting prices for them
              ordersSurcharges[orderId].push({
                surchargeId,
                materialId,
                refactoredPriceId: surchargeRateId,
                refactoredAmount: surchargeRate,
                quantity: 1,
              });

              switch (calculation) {
                case SURCHARGE_CALCULATION.flat: {
                  return {
                    surchargeId,
                    billableServiceId,
                    materialId,
                    calculation,
                    materialBasedPricing,
                    total: null,
                    rate: surchargeRate,
                    amount: surchargeRate,
                  };
                }
                case SURCHARGE_CALCULATION.percentage: {
                  const lineItemsSurcharges = getSurchargesCalculationForLineItems({
                    lineItems,
                    existingOrderPrices,
                    priceGroupPrices,
                    surcharges,
                  });

                  const thresholdsSurcharges = getSurchargesCalculationForThresholds({
                    thresholds,
                    existingOrderPrices,
                    priceGroupPrices,
                    surcharges,
                  });

                  return [
                    applySurcharges
                      ? {
                          surchargeId,
                          billableServiceId,
                          materialId,
                          calculation,
                          materialBasedPricing,
                          total,
                          rate: surchargeRate,
                          amount: Math.trunc((total * surchargeRate) / 100_000_000),
                        }
                      : null,
                  ]
                    .concat(lineItemsSurcharges)
                    .concat(thresholdsSurcharges);
                }
                default: {
                  return null;
                }
              }
            },
          );
        }

        return appliedSurcharges.flat(2).filter(Boolean);
      },
    ),
  );

  return calculations;
};

export default getSurchargesCalculation;
