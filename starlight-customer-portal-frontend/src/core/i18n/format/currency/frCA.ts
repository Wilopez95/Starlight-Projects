import currency from 'currency.js';

import { IFormatCurrency } from '@root/core/i18n/types';

export const currencySymbolFrCA = '$';

export const formatFrCaMoney: IFormatCurrency = (value: number | undefined): string => {
  const result = currency(value ?? 0, { symbol: currencySymbolFrCA, precision: 2, pattern: `# !` });

  return result.format();
};
