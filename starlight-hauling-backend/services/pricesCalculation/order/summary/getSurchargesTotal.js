const getSurchargesTotal = (orders = [], surcharges = []) => {
  const surchargesTotal =
    orders?.reduce((orderSurchargesTotal, { quantity = 0 }, idx) => {
      const surchargesTotalPerService =
        surcharges?.[idx]?.reduce(
          (totalPerService, { amount = 0 }) => totalPerService + (amount || 0),
          0,
        ) || 0;

      return orderSurchargesTotal + surchargesTotalPerService * quantity;
    }, 0) || 0;

  return Math.trunc(surchargesTotal);
};

export default getSurchargesTotal;
