export const toFixed = (val: number, fraction = 2) => val.toFixed(fraction);

export const calculateFinalPrice = (operation: boolean, value: number, price: number) => {
  if (!operation) {
    value = -value;
  }

  return toFixed(price * (1 + value / 100));
};

export const calculatePercentage = (globalPrice: number, price: number) => {
  if (globalPrice) {
    if (globalPrice === price) {
      return undefined;
    }
    const percentage = 100 - (price / globalPrice) * 100;
    const percentageFactor = price < globalPrice ? 1 : -1;

    return (percentage * percentageFactor).toString();
  }

  return undefined;
};
