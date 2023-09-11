import currency from 'currency.js';

import { IFormatCurrency } from '@root/i18n/types';

export const currencySymbolEnGB = '£';
export const currencySymbolEnUS = '$';
export const currencySymbolEnEU = '€';
export const currencySymbolFrCA = '$';

const commonNegativePattern = `! -#`;

// todo: set correct currency symbol when format will be set by tenant
export const formatEnGBMoney: IFormatCurrency = (value = 0): string => {
  const result = currency(value, {
    symbol: currencySymbolEnUS,
    precision: 2,
    negativePattern: commonNegativePattern,
  });

  return result.format();
};

export const formatEnEUMoney: IFormatCurrency = (value = 0): string => {
  const result = currency(value, {
    symbol: currencySymbolEnEU,
    precision: 2,
    negativePattern: commonNegativePattern,
  });

  return result.format();
};

export const formatEnUSMoney: IFormatCurrency = (value = 0): string => {
  const result = currency(value, {
    symbol: currencySymbolEnUS,
    precision: 2,
    negativePattern: commonNegativePattern,
  });

  return result.format();
};

export const formatFrCaMoney: IFormatCurrency = (value = 0): string => {
  const result = currency(value, {
    symbol: currencySymbolFrCA,
    precision: 2,
    pattern: `# !`,
    negativePattern: `-# !`,
  });

  return result.format();
};
