import isEmpty from 'lodash/isEmpty.js';

import { calculateSubOrderSurcharge } from './calculateSurcharge.js';

import { mapSurchargeToOrder } from './mapSurchargeToOrder.js';

const getSurchargesInfo = async (
  ctx,
  {
    businessLineId,
    businessUnitId,
    customRatesGroupId,
    subscriptionOrder,
    needRecalculateSurcharge,
  },
  { SubsriptionSurchargeRepo, ...dependencies },
) => {
  const { applySurcharges = true, subscriptionOrderId } = subscriptionOrder;

  let orderSurcharges = [];
  let surchargeTotals = {
    totalSurchargePrice: 0,
  };

  if (applySurcharges) {
    if (subscriptionOrderId && !needRecalculateSurcharge) {
      orderSurcharges = await SubsriptionSurchargeRepo.getInstance(ctx.state).populateBy({
        condition: { subscriptionOrderId },
      });
    }
    if (needRecalculateSurcharge || !subscriptionOrderId) {
      ({ orderSurcharges } = await calculateSubOrderSurcharge(
        ctx,
        {
          businessUnitId,
          businessLineId,
          customRatesGroupId,
          subscriptionOrder,
        },
        dependencies,
      ));
    }

    if (!isEmpty(orderSurcharges)) {
      surchargeTotals = mapSurchargeToOrder(orderSurcharges, subscriptionOrder);
    }
  }

  return {
    orderSurcharges,
    surchargeTotals,
  };
};

export default getSurchargesInfo;
