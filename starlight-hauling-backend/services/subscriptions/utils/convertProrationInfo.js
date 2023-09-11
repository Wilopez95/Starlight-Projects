export const convertProrationInfo = prorationInfo => {
  const map = new Map();

  prorationInfo.forEach(
    ({ serviceItemProrationInfo, lineItemsProrationInfo, serviceItemId, billableServiceId }) => {
      serviceItemProrationInfo.forEach(({ subscriptionOrdersSort, ...serviceItem }) => {
        const { since, from, nextBillingPeriodFrom, nextBillingPeriodTo } = serviceItem;

        map.set(`${serviceItemId}-${since}-${from}`, {
          periodFrom: since,
          periodTo: from,
          nextBillingPeriodFrom,
          nextBillingPeriodTo,
          serviceItemProrationInfo: serviceItem,
          subscriptionOrders: subscriptionOrdersSort,
          serviceItemId,
          billableServiceId,
        });
      });

      lineItemsProrationInfo.forEach(lineItem => {
        const { since, from, nextBillingPeriodFrom, nextBillingPeriodTo } = lineItem;
        const key = `${serviceItemId}-${since}-${from}`;

        const period = map.get(key) ?? {
          periodFrom: since,
          periodTo: from,
          nextBillingPeriodFrom,
          nextBillingPeriodTo,
          serviceItemId,
          billableServiceId,
        };

        map.set(key, {
          ...period,
          lineItemsProrationInfo: [...(period.lineItemsProrationInfo ?? []), lineItem],
        });
      });
    },
  );
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.periodFrom).getTime() - new Date(a.periodFrom).getTime(),
  );
};
