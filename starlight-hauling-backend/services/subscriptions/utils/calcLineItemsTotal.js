export const calcLineItemsTotal = prorationInfo =>
  prorationInfo.reduce(
    (lineItemsTotal, { lineItemsProrationInfo }) =>
      lineItemsTotal +
      lineItemsProrationInfo.reduce(
        (subscriptionLineItemsTotal, { proratedTotal }) =>
          subscriptionLineItemsTotal + proratedTotal,
        0,
      ),
    0,
  );
