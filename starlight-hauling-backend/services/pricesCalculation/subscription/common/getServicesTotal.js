const getServicesTotal = (serviceItemsWithCurrentPrices = []) => {
  const serviceItemsTotal =
    serviceItemsWithCurrentPrices?.reduce(
      (total, { price = 0, quantity = 0 }) => price * quantity + total,
      0,
    ) || 0;

  return serviceItemsTotal;
};

export default getServicesTotal;
