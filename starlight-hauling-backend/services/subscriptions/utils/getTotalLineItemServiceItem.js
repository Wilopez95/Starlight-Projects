export const getTotalLineItemServiceItem = ({ summaryPerServiceItem }) => {
  const response = [];

  for (const summaryServiceItem of summaryPerServiceItem) {
    // key is id
    // value is summary
    const lineItemIdToSum = {};
    const subOrders = [];

    const { serviceItemId, lineItems = [], serviceItems } = summaryServiceItem;

    for (const lineItem of lineItems) {
      const { lineItemId, totalPrice } = lineItem;
      if (lineItemIdToSum[lineItemId]) {
        // eslint-disable-next-line operator-assignment
        lineItemIdToSum[lineItemId] = lineItemIdToSum[lineItemId] + totalPrice;
      } else {
        lineItemIdToSum[lineItemId] = totalPrice;
      }
    }
    let summaryServiceItems = 0;

    for (const serviceItem of serviceItems) {
      const { totalPrice, subscriptionOrders = [] } = serviceItem;
      summaryServiceItems += totalPrice;
      subOrders.push(...subscriptionOrders);
    }

    response.push({
      serviceItemId,
      invoicedTotal: summaryServiceItems,
      lineItemIdToSum,
      subscriptionOrders: subOrders,
    });
  }

  return response;
};
