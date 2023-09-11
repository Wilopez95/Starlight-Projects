export const mapSurchargeToOrder = (surcharges, subscriptionOrder) => {
  const groupedTotals = surcharges.reduce(
    (acc, item) => {
      if (item.billableLineItemId) {
        const totalPrice = acc[item.billableLineItemId]?.totalPrice || 0;
        const lineItemSurchargePrice = item.amount;
        acc[item.billableLineItemId] = totalPrice + lineItemSurchargePrice;

        acc.totalSurchargePrice += item.amount;
      } else {
        acc.totalPrice += item.amount * item.quantity;
        acc.totalSurchargePrice += item.amount * item.quantity;
      }

      return acc;
    },
    { totalPrice: subscriptionOrder.totalPrice, totalSurchargePrice: 0 },
  );

  const lineItems = subscriptionOrder.lineItems?.map(lineItem => {
    const lineItemSurchargePrice = groupedTotals[lineItem.billableLineItemId] || 0;

    return {
      billableLineItemId: lineItem.billableLineItemId,
      totalPrice: lineItem.totalPrice + lineItemSurchargePrice,
    };
  });

  return {
    lineItems,
    totalPrice: groupedTotals.totalPrice,
    totalSurchargePrice: groupedTotals.totalSurchargePrice,
  };
};
