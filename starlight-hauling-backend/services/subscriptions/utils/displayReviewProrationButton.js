import { compareLineItems } from './compareLineItems.js';

export const displayReviewProrationButton = (serviceItems, serviceItemsHt) => {
  for (const serviceItem of serviceItems) {
    const { serviceItemId, lineItems = [], price, quantity } = serviceItem;
    const serviceItemHt = serviceItemsHt.find(obj => obj.serviceItemId === serviceItemId);

    if (!serviceItemHt) {
      return true;
    }

    const { price: priceHt, quantity: quantityHt } = serviceItemHt;

    if (+priceHt !== price || +quantityHt !== quantity) {
      return true;
    }
    for (const lineItem of lineItems) {
      const compareResult = compareLineItems({ lineItem, serviceItemHt, lineItems });

      if (compareResult) {
        return true;
      }
    }
  }
  return false;
};
