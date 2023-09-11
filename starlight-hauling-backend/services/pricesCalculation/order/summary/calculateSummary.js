const calculateSummary = ({
  order,
  lineItems = [],
  thresholdItems = [],
  surchargeItems = [],
  taxesTotal = 0,
}) => {
  const serviceTotal = order.billableServicePrice || 0;
  const lineItemsTotal =
    lineItems.reduce((res, { price = 0, quantity = 0 }) => res + (price * quantity || 0), 0) || 0;
  const thresholdItemsTotal =
    thresholdItems.reduce((res, { price = 0, quantity = 0 }) => res + (price * quantity || 0), 0) ||
    0;
  const surchargeItemsTotal =
    surchargeItems.reduce(
      (res, { amount = 0, quantity = 0 }) => res + (amount * quantity || 0),
      0,
    ) || 0;
  const billableItemsTotal = lineItemsTotal + thresholdItemsTotal;
  const orderTotal = serviceTotal + billableItemsTotal;
  const orderTotalsWithSurcharges = orderTotal + surchargeItemsTotal;
  const includingSurcharges = surchargeItemsTotal > 0;
  const grandTotal = orderTotalsWithSurcharges + taxesTotal;

  return {
    serviceTotal,
    lineItemsTotal,
    thresholdItemsTotal,
    surchargeItemsTotal,
    billableItemsTotal,
    orderTotal,
    orderTotalsWithSurcharges,
    includingSurcharges,
    taxesTotal,
    grandTotal,
  };
};

export default calculateSummary;
