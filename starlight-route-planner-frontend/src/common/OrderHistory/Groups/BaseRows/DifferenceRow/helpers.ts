import { format } from 'date-fns-tz';
import { isNil } from 'lodash-es';

import { parseDate } from '@root/helpers';
import { IntlConfig } from '@root/i18n/types';

import { ChangeFormat } from './types';

export const formatValue = (
  value: string | number | undefined,
  timeZone: string,
  { dateFormat, formatCurrency }: IntlConfig,
  formatVariant?: ChangeFormat,
) => {
  if (isNil(value)) {
    return;
  }

  if (isNil(formatVariant)) {
    return value;
  }

  switch (formatVariant) {
    case 'id': {
      return `#${value}`;
    }
    case 'money': {
      return formatCurrency(+value);
    }
    case 'time': {
      const parsedDate = parseDate(value);

      return format(parsedDate, dateFormat.time, { timeZone });
    }
    case 'date': {
      const parsedDate = parseDate(value);

      return format(parsedDate, dateFormat.date);
    }
    default:
      break;
  }
};
