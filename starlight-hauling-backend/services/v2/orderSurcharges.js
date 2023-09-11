import cloneDeep from 'lodash/fp/cloneDeep.js';
import uniqBy from 'lodash/uniqBy.js';

import { mathRound2 } from '../../utils/math.js';

import { SURCHARGE_CALCULATION } from '../../consts/surcharges.js';

export const calculateSurcharges = ({
  globalRatesSurcharges,
  customRatesSurcharges,
  materialId,
  billableServiceId,
  billableServicePrice,
  billableServiceApplySurcharges,
  surcharges: currentSurcharges = [],
  addedSurcharges,
  lineItems,
  thresholds,
  serviceQuantity = 1,
}) => {
  let surcharges = currentSurcharges;
  let addedCustomRates = [];
  let addedGlobalRates = [];

  if (addedSurcharges) {
    surcharges = uniqBy(
      addedSurcharges?.map(({ surcharge }) => ({ ...surcharge, id: surcharge.originalId })),
      'id',
    );
    addedCustomRates = uniqBy(
      addedSurcharges?.map(({ customRatesGroupSurcharge }) => ({
        ...customRatesGroupSurcharge,
        id: customRatesGroupSurcharge?.originalId,
      })),
      'id',
    );

    addedGlobalRates = uniqBy(
      addedSurcharges?.map(({ globalRatesSurcharge }) => ({
        ...globalRatesSurcharge,
        id: globalRatesSurcharge.originalId,
      })),
      'id',
    );
  }

  const globalRates = addedGlobalRates.concat(globalRatesSurcharges ?? []);
  const customRates = addedCustomRates.concat(customRatesSurcharges ?? []);

  const getGlobalRate = (surchargeId, rateMaterialId) =>
    globalRates?.find(
      surchargeRate =>
        surchargeRate.surchargeId === surchargeId && surchargeRate.materialId === rateMaterialId,
    );
  const getCustomRate = (surchargeId, rateMaterialId) =>
    customRates?.find(
      surchargeRate =>
        surchargeRate.surchargeId === surchargeId && surchargeRate.materialId === rateMaterialId,
    );

  const getRate = (surchargeId, rateMaterialId) =>
    getCustomRate(surchargeId, rateMaterialId) || getGlobalRate(surchargeId, rateMaterialId);

  let serviceTotalWithSurcharges = Number(billableServicePrice) || 0;
  let orderSurchargesTotal = 0;
  const lineItemsWithSurcharges = cloneDeep(lineItems);
  const thresholdsWithSurcharges = cloneDeep(thresholds);

  const orderSurcharges = [];

  surcharges?.forEach(surcharge => {
    let rate;
    if (surcharge.materialBasedPricing && materialId) {
      rate = getRate(surcharge.id, materialId);
    } else if (!surcharge.materialBasedPricing) {
      rate = getRate(surcharge.id, null);
    }

    if (surcharge.calculation === SURCHARGE_CALCULATION.flat && rate) {
      orderSurchargesTotal = mathRound2(orderSurchargesTotal + (rate.price || 0));

      serviceTotalWithSurcharges = mathRound2(serviceTotalWithSurcharges + rate.price);

      orderSurcharges.push({
        surchargeId: surcharge.id,
        materialId,
        globalRatesSurchargesId: getGlobalRate(
          surcharge.id,
          surcharge.materialBasedPricing ? materialId : null,
        )?.id,
        customRatesGroupSurchargesId:
          getCustomRate(surcharge.id, surcharge.materialBasedPricing ? materialId : null)?.id ||
          null,
        amount: rate.price,
        quantity: serviceQuantity,
      });
    }

    if (surcharge.calculation === SURCHARGE_CALCULATION.percentage) {
      if (billableServiceApplySurcharges && rate && billableServicePrice !== 0) {
        const surchargeValue = mathRound2((billableServicePrice * (rate.price || 0)) / 100);
        orderSurchargesTotal = mathRound2(orderSurchargesTotal + surchargeValue);
        serviceTotalWithSurcharges = mathRound2(serviceTotalWithSurcharges + surchargeValue);

        orderSurcharges.push({
          materialId,
          billableServiceId,
          surchargeId: surcharge.id,
          globalRatesSurchargesId: getGlobalRate(
            surcharge.id,
            surcharge.materialBasedPricing ? materialId : null,
          )?.id,
          customRatesGroupSurchargesId:
            getCustomRate(surcharge.id, surcharge.materialBasedPricing ? materialId : null)?.id ||
            null,
          amount: surchargeValue,
          quantity: serviceQuantity,
        });
      }

      lineItems?.forEach((lineItem, index) => {
        let lineItemRate;

        const lineItemMaterialId = lineItem.materialId ?? materialId ?? null;
        if (surcharge.materialBasedPricing && lineItemMaterialId) {
          lineItemRate = getRate(surcharge.id, lineItemMaterialId);
        } else if (!surcharge.materialBasedPricing) {
          lineItemRate = getRate(surcharge.id, null);
        }

        const lineItemTotal = lineItem.price * lineItem.quantity;

        if (lineItem.applySurcharges && lineItemRate) {
          const surchargeValue = mathRound2((lineItemTotal * (lineItemRate.price || 0)) / 100);
          orderSurchargesTotal = mathRound2(orderSurchargesTotal + surchargeValue);

          lineItemsWithSurcharges[index].price = mathRound2(
            lineItemsWithSurcharges[index].price +
              mathRound2((lineItem.price * (lineItemRate.price || 0)) / 100),
          );

          orderSurcharges.push({
            materialId: lineItemMaterialId,
            surchargeId: surcharge.id,
            billableLineItemId: lineItem.billableLineItemId,
            globalRatesSurchargesId: getGlobalRate(
              surcharge.id,
              surcharge.materialBasedPricing ? lineItemMaterialId : null,
            )?.id,
            customRatesGroupSurchargesId:
              getCustomRate(
                surcharge.id,
                surcharge.materialBasedPricing ? lineItemMaterialId : null,
              )?.id || null,
            amount: surchargeValue,
            quantity: lineItem.quantity,
          });
        }
      });
      if (!surcharge.materialBasedPricing) {
        thresholds?.forEach((threshold, index) => {
          const thresholdRate = getRate(surcharge.id, null);
          const thresholdTotal = (threshold?.price || 0) * (threshold?.quantity || 0);

          if (threshold.applySurcharges && thresholdRate) {
            const surchargeValue = mathRound2((thresholdTotal * (thresholdRate.price || 0)) / 100);
            orderSurchargesTotal = mathRound2(orderSurchargesTotal + surchargeValue);

            thresholdsWithSurcharges[index].price = mathRound2(
              thresholdsWithSurcharges[index].price +
                mathRound2(((threshold?.price || 0) * (thresholdRate.price || 0)) / 100),
            );

            orderSurcharges.push({
              surchargeId: surcharge.id,
              thresholdId: threshold.threshold.originalId,
              globalRatesSurchargesId: getGlobalRate(surcharge.id, null)?.id,
              customRatesGroupSurchargesId: getCustomRate(surcharge.id, null)?.id,
              amount: surchargeValue,
              quantity: threshold.quantity,
            });
          }
        });
      }
    }
  });

  return {
    surchargesTotal: orderSurchargesTotal ? mathRound2(orderSurchargesTotal) : 0,
    serviceTotalWithSurcharges,
    lineItemsWithSurcharges,
    thresholdsWithSurcharges,
    orderSurcharges,
  };
};
