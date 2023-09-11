import isNull from 'lodash/isNull.js';
import getPriceForBillableItem from '../common/getPriceForBillableItem/getPriceForBillableItem.js';

import { PRICE_ENTITY_TYPE_CAMEL_CASE } from '../../../../consts/priceEntityTypes.js';
import { SURCHARGE_CALCULATION } from '../../../../consts/surcharges.js';

const getSurchargesCalculationForThresholds = ({
  thresholds = [],
  priceGroupPrices,
  surcharges,
}) => {
  const calculations = thresholds.map(
    ({
      thresholdItemId,
      thresholdId,
      materialId,
      total,
      needRecalculateSurcharges,
      applySurcharges,
    }) => {
      let appliedSurcharges = [];

      if (!isNull(total) || (thresholdItemId && needRecalculateSurcharges)) {
        appliedSurcharges = surcharges.map(
          ({ id: surchargeId, materialBasedPricing, calculation }) => {
            const conditions = {
              entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.surcharge,
              materialId: materialBasedPricing ? materialId : null,
              surchargeId,
            };

            const { price: surchargeRate = null } =
              getPriceForBillableItem(conditions, priceGroupPrices) ?? {};

            if (isNull(surchargeRate)) {
              return null;
            }

            switch (calculation) {
              case SURCHARGE_CALCULATION.percentage: {
                return applySurcharges
                  ? {
                      surchargeId,
                      thresholdId,
                      materialId,
                      calculation,
                      materialBasedPricing,
                      total,
                      rate: surchargeRate,
                      amount: Math.trunc((total * surchargeRate) / 100_000_000),
                    }
                  : null;
              }
              default: {
                return null;
              }
            }
          },
        );
      }

      return appliedSurcharges.filter(Boolean);
    },
  );

  return calculations;
};

export default getSurchargesCalculationForThresholds;
