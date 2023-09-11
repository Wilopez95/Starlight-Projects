import currency from 'currency.js';

import { IFormatCurrency } from '@root/core/i18n/types';

export const currencySymbolEnGB = '£';

export const formatEnGBMoney: IFormatCurrency = (value: number | undefined): string => {
  const result = currency(value ?? 0, { symbol: currencySymbolEnGB, precision: 2 });

  return result.format();
};
