import cloneDeep from 'lodash/cloneDeep.js';

const calculateTotalPrices = subscriptionOrder => {
  const clonedSubscriptionOrder = cloneDeep(subscriptionOrder);
  const { quantity, price, lineItems } = clonedSubscriptionOrder;
  clonedSubscriptionOrder.totalPrice = quantity * price;
  clonedSubscriptionOrder.lineItems = lineItems.map(lineItem => {
    lineItem.totalPrice = lineItem.quantity * lineItem.price;
    return lineItem;
  });

  return clonedSubscriptionOrder;
};

export default calculateTotalPrices;
