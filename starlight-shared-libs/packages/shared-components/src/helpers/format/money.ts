const defaultConfig = {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
};
const formatter = new Intl.NumberFormat('en-US', defaultConfig);

export const formatMoney = (value = 0, fraction = 0): string => {
  if (fraction !== 0) {
    return new Intl.NumberFormat('en-US', {
      ...defaultConfig,
      minimumFractionDigits: fraction,
    }).format(value);
  }

  return formatter.format(value);
};
