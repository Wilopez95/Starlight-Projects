const getProratedTotalForBillingPeriod = (billingPeriod = []) => {
  const proratedTotalPerBillingPeriod =
    billingPeriod?.reduce((billingPeriodTotal, prorationPeriod) => {
      const proratedTotalPerProrationPeriod =
        prorationPeriod?.reduce(
          (
            prorationPeriodTotal,
            { serviceItemProrationInfo, lineItemsProrationInfo, subscriptionOrders },
          ) => {
            const proratedLineItemsTotalPerService =
              lineItemsProrationInfo?.reduce(
                (lineItemsTotal, { proratedTotal = 0 }) => proratedTotal + lineItemsTotal,
                0,
              ) || 0;

            const proratedSubscriptionOrdersTotalPerService =
              subscriptionOrders?.reduce(
                (subscriptionOrdersTotal, { totalPrice = 0 }) =>
                  totalPrice + subscriptionOrdersTotal,
                0,
              ) || 0;

            return (
              prorationPeriodTotal +
              (serviceItemProrationInfo?.proratedTotal || 0) +
              proratedLineItemsTotalPerService +
              proratedSubscriptionOrdersTotalPerService
            );
          },
          0,
        ) || 0;

      return billingPeriodTotal + proratedTotalPerProrationPeriod;
    }, 0) || 0;

  return proratedTotalPerBillingPeriod;
};

export default getProratedTotalForBillingPeriod;
