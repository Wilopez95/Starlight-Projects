const getProratedRecurringTotalForBillingPeriod = (billingPeriod = []) => {
  const proratedTotalPerBillingPeriod = billingPeriod.reduce(
    (billingPeriodTotal, prorationPeriod) => {
      const proratedTotalPerProrationPeriod =
        prorationPeriod?.reduce(
          (prorationPeriodTotal, { serviceItemProrationInfo, lineItemsProrationInfo }) => {
            const proratedLineItemsTotalPerService =
              lineItemsProrationInfo?.reduce(
                (lineItemsTotal, { proratedTotal = 0 }) => proratedTotal + lineItemsTotal,
                0,
              ) || 0;

            return (
              prorationPeriodTotal +
              (serviceItemProrationInfo?.proratedTotal || 0) +
              proratedLineItemsTotalPerService
            );
          },
          0,
        ) || 0;

      return billingPeriodTotal + proratedTotalPerProrationPeriod;
    },
    0,
  );

  return proratedTotalPerBillingPeriod;
};

export default getProratedRecurringTotalForBillingPeriod;
