export const getSubscriptionOrdersTotal = (subscriptionOrders = []) => {
  const subscriptionOrdersTotal =
    subscriptionOrders?.reduce(
      (total, { price = 0, quantity = 0 }) => price * quantity + total,
      0,
    ) || 0;

  return subscriptionOrdersTotal;
};

export const getLineItemsTotal = (subscriptionOrders = []) => {
  const lineItemsTotal = subscriptionOrders.reduce((total, { lineItems }) => {
    const lineItemsTotalPerService =
      lineItems?.reduce(
        (totalPerService, { price = 0, quantity = 0 }) => price * quantity + totalPerService,
        0,
      ) || 0;

    return total + lineItemsTotalPerService;
  }, 0);

  return lineItemsTotal;
};

export const getTaxesTotal = (subscriptionOrders = []) => {
  const taxesTotal = subscriptionOrders.reduce((total, { appliedTaxes, lineItems }) => {
    const subscriptionOrdersTotal = appliedTaxes
      .flat()
      .reduce((sum, { calculatedTax }) => sum + calculatedTax, 0);
    const lineItemsTotal =
      lineItems?.reduce(
        (acc, { appliedTaxes: lineItemAppliedTaxes }) =>
          acc +
          lineItemAppliedTaxes.flat().reduce((sum, { calculatedTax }) => sum + calculatedTax, 0),
        0,
      ) ?? 0;

    return total + subscriptionOrdersTotal + lineItemsTotal;
  }, 0);

  return taxesTotal;
};
