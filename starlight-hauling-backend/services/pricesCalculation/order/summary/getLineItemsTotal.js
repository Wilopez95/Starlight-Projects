const getLineItemsTotal = (orders = []) => {
  const lineItemsTotal =
    orders?.reduce((ordersTotal, { lineItems = [], quantity = 0 }) => {
      const lineItemsTotalPerService =
        lineItems?.reduce((totalPerService, { total = 0 }) => totalPerService + (total || 0), 0) ||
        0;

      return ordersTotal + lineItemsTotalPerService * quantity;
    }, 0) || 0;

  return Math.trunc(lineItemsTotal);
};

export default getLineItemsTotal;
