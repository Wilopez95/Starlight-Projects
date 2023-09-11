const getSubscriptionOrdersTotal = (serviceItemsWithCurrentPrices = []) => {
  const subscriptionOrdersTotal =
    serviceItemsWithCurrentPrices?.reduce((total, { subscriptionOrders = [] }) => {
      const subscriptionOrdersTotalPerService =
        subscriptionOrders?.reduce(
          (totalPerService, { price = 0, quantity = 0 }) => price * quantity + totalPerService,
          0,
        ) || 0;

      return total + subscriptionOrdersTotalPerService;
    }, 0) || 0;

  return subscriptionOrdersTotal;
};

export default getSubscriptionOrdersTotal;
