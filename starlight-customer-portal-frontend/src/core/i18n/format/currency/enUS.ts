import currency from 'currency.js';

import { IFormatCurrency } from '@root/core/i18n/types';

export const currencySymbolEnUS = '$';

export const formatEnUSMoney: IFormatCurrency = (value: number | undefined): string => {
  const result = currency(value ?? 0, { symbol: currencySymbolEnUS, precision: 2 });

  return result.format();
};
