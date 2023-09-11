import { format, isValid, parse } from 'date-fns';

import { IntlConfig } from '@root/i18n/types';

const today = new Date();

export const parseDate = (date: string, formatString: string) => {
  let result = parse(date, formatString, today);

  if (isValid(result)) {
    return result;
  }

  result = new Date(date);

  if (isValid(result)) {
    return result;
  }

  return undefined;
};

export const formatDate = (date: Date, formatString: string) => format(date, formatString);

export const formatValue = (from: Date | null, to: Date | null, { formatDateTime }: IntlConfig) => {
  let toValue = '';

  if (to) {
    toValue = ` - ${formatDateTime(to).date}`;
  }
  if (from) {
    return `${formatDateTime(from).date}${toValue}`;
  }

  return ' ';
};
