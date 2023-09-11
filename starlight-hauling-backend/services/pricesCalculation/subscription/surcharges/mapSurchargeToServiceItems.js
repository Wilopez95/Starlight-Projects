const acumulateTotals = surcharges =>
  surcharges?.reduce(
    (acc, item) => {
      const accumulatePrice = (type, id) => {
        const totalPrice = acc[type][id] || 0;
        acc[type][id] = totalPrice + item.amount;
      };

      if (item.billableServiceId) {
        accumulatePrice('serviceItem', item.billableServiceId);
      }

      if (item.billableLineItemId) {
        accumulatePrice('lineItem', item.billableLineItemId);
      }

      if (item.oneTimebillableItemId) {
        accumulatePrice('subOrder', item.oneTimebillableItemId);
      }

      acc.totalSurchargePrice += item.amount;

      return acc;
    },
    { totalSurchargePrice: 0, serviceItem: {}, lineItem: {}, subOrder: {} },
  );

const mapServiceItem = (serviceItem, groupedTotals) => {
  const serviceItemInfo = serviceItem.serviceItemProrationInfo;
  const serviceItemSurchargePrice =
    groupedTotals?.serviceItem?.[serviceItemInfo.billableServiceId] || 0;

  const serviceItemProrationInfo = {
    billableServiceId: serviceItemInfo.billableServiceId,
    proratedTotal: serviceItemInfo.proratedTotal + serviceItemSurchargePrice,
  };

  const lineItemsProrationInfo = serviceItem?.lineItemsProrationInfo.map(lineItemInfo => {
    const lineItemSurchargePrice = groupedTotals?.lineItem[lineItemInfo.billableLineItemId] || 0;

    return {
      billableLineItemId: lineItemInfo.billableLineItemId,
      proratedTotal: lineItemInfo.proratedTotal + lineItemSurchargePrice,
    };
  });

  const subscriptionOrders = serviceItem?.subscriptionOrders.map(subOrder => {
    const subOrderSurchargePrice = groupedTotals?.subOrder[subOrder.billableServiceId] || 0;

    return {
      billableLineItemId: subOrder.billableServiceId,
      proratedTotal: subOrder.totalPrice + subOrderSurchargePrice,
    };
  });

  return {
    serviceItemProrationInfo,
    lineItemsProrationInfo,
    subscriptionOrders,
  };
};

const mapSurchargeToServiceItems = (serviceItem, surcharges) => {
  const groupedTotals = acumulateTotals(surcharges);

  const { lineItemsProrationInfo, serviceItemProrationInfo, subscriptionOrders } = mapServiceItem(
    serviceItem,
    groupedTotals,
  );

  return {
    lineItemsProrationInfo,
    serviceItemProrationInfo,
    subscriptionOrders,
    totalSurchargePrice: groupedTotals?.totalSurchargePrice,
  };
};

export default mapSurchargeToServiceItems;
