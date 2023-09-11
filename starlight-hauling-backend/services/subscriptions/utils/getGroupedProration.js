import { mathRound2 } from '../../../utils/math.js';

export const getGroupedProration = prorationInfo => {
  const result = prorationInfo.map(info =>
    info.map(prorationPerCycle => {
      const { lineItemsProrationInfo, serviceItemProrationInfo } = prorationPerCycle;

      const [{ nextBillingPeriodFrom, nextBillingPeriodTo, billableServiceId, serviceItemId }] =
        serviceItemProrationInfo;
      const serviceItemTotal = serviceItemProrationInfo.reduce(
        (accum, item) => {
          const { subscriptionOrdersSort = [] } = item;
          const subOrdersTotal = subscriptionOrdersSort.reduce(
            (total, { price, quantity }) => total + mathRound2(price * quantity),
            0,
          );
          return item.isApplicable
            ? mathRound2(accum + item.proratedTotal + subOrdersTotal)
            : accum;
        },

        0,
      );
      const lineItemTotal = lineItemsProrationInfo.reduce(
        (accum, lineItem) => mathRound2(accum + lineItem.proratedTotal),
        0,
      );
      const prorationObj = {
        // on create it is 0
        serviceItemId: serviceItemId ? Number(serviceItemId) : 0,
        proratedAmount: lineItemTotal + serviceItemTotal,
        nextBillingPeriodFrom,
        nextBillingPeriodTo,
        billableServiceId,
        ...prorationPerCycle,
      };

      return prorationObj;
    }),
  );
  return result;
};
