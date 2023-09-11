export const compareLineItems = ({ lineItem, serviceItemHt, lineItems }) => {
  const { price: lineItemPrice, quantity: lineItemQuantity, lineItemId } = lineItem;

  const { lineItems: lineItemsHt } = serviceItemHt;

  if (!lineItemsHt || lineItemsHt.length !== lineItems.length) {
    return true;
  }

  const lineItemHt = lineItemsHt.find(obj => obj.lineItemId === lineItemId);

  if (!lineItemHt) {
    return true;
  }
  const { price: lineItemHtPrice, quantity: lineItemHtQuantity } = lineItemHt;

  if (
    lineItemHtPrice !== lineItemPrice ||
    String(lineItemHtQuantity) !== String(lineItemQuantity)
  ) {
    return true;
  }
  return false;
};
