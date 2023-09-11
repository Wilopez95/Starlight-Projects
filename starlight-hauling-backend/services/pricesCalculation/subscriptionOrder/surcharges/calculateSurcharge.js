import { calculateSurcharges } from '../../../orderSurcharges.js';

import { calcRates } from '../../../orderRates.js';

export const calculateSubOrderSurcharge = async (
  ctx,
  { businessUnitId, businessLineId, customRatesGroupId, subscriptionOrder },
  { BillableSurchargeRepo, BillableServiceRepo },
) => {
  const { materialId, billableServiceId, lineItems, quantity, price } = subscriptionOrder;
  const surcharges = await BillableSurchargeRepo.getInstance(ctx.state).getAll({
    condition: { active: true, businessLineId },
  });

  let billableServiceApplySurcharges = false;
  let orderSurcharges = [];

  if (billableServiceId) {
    const billableService = await BillableServiceRepo.getInstance(ctx.state).getById({
      id: billableServiceId,
      fields: ['applySurcharges'],
    });

    billableServiceApplySurcharges = billableService.applySurcharges;
  }

  const { customRates, globalRates } = await calcRates(ctx.state, {
    businessUnitId,
    businessLineId,
    customRatesGroupId,
    type: customRatesGroupId ? 'custom' : 'global',
  });

  ({ orderSurcharges } = calculateSurcharges({
    globalRatesSurcharges: globalRates?.globalRatesSurcharges,
    customRatesSurcharges: customRates?.customRatesSurcharges,
    materialId,
    billableServiceId,
    billableServicePrice: price,
    billableServiceApplySurcharges,
    lineItems,
    surcharges,
    serviceQuantity: quantity,
  }));

  return { orderSurcharges };
};
