const getThresholdsTotal = (orders = []) => {
  const thresholdsTotal =
    orders?.reduce((ordersTotal, { thresholds = [], quantity = 0 }) => {
      const thresholdsTotalPerService =
        thresholds?.reduce((totalPerService, { total = 0 }) => totalPerService + (total || 0), 0) ||
        0;

      return ordersTotal + thresholdsTotalPerService * quantity;
    }, 0) || 0;

  return Math.trunc(thresholdsTotal);
};

export default getThresholdsTotal;
