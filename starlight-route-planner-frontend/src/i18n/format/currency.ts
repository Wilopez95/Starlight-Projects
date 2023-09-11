import currency from 'currency.js';

import { IFormatCurrency } from '@root/i18n/types';

export const currencySymbolEnGB = '£';
export const currencySymbolEnUS = '$';
export const currencySymbolFrCA = '$';

// todo: set correct currency symbol when format will be set by tenant
export const formatEnGBMoney: IFormatCurrency = (value: number | undefined): string => {
  const result = currency(value ?? 0, {
    symbol: currencySymbolEnUS,
    precision: 2,
  });

  return result.format();
};

export const formatEnUSMoney: IFormatCurrency = (value: number | undefined): string => {
  const result = currency(value ?? 0, {
    symbol: currencySymbolEnUS,
    precision: 2,
  });

  return result.format();
};

export const formatFrCaMoney: IFormatCurrency = (value: number | undefined): string => {
  const result = currency(value ?? 0, {
    symbol: currencySymbolFrCA,
    precision: 2,
    pattern: `# !`,
  });

  return result.format();
};
