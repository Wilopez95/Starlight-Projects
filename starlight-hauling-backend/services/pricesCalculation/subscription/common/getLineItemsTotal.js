const getLineItemsTotal = (serviceItemsWithCurrentPrices = []) => {
  const lineItemsTotal = serviceItemsWithCurrentPrices.reduce((total, { lineItems = [] }) => {
    const lineItemsTotalPerService =
      lineItems?.reduce(
        (totalPerService, { price = 0, quantity = 0 }) => price * quantity + totalPerService,
        0,
      ) || 0;

    return total + lineItemsTotalPerService;
  }, 0);

  return lineItemsTotal;
};

export default getLineItemsTotal;
