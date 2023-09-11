import { format } from 'date-fns';

import { IDateTimeFormatComponents } from '../../types';

export const formatDateEnGB = (locale: Locale) => (value: Date) => {
  return {
    time: format(value, 'h:mm a', { locale }),
    time24: format(value, 'HH:mm', { locale }),
    date: format(value, 'dd/mm/yyyy', { locale }),
    dateDefault: format(value, 'dd/mm/yyyy', { locale }),
    dateTZ: format(value, 'dd/mm/yyyy HH:mm:ss+hh:mm', { locale }),
    dateTime: format(value, `dd/mm/yyyy, hh:mm`, { locale }),
    ISO: format(value, "dd/mm/yyyy'T'HH:mm:ss'Z'", { locale }),
  };
};

export const dateFormatsEnGB: IDateTimeFormatComponents = {
  time: 'h:mm a',
  time24: 'HH:mm',
  date: 'dd/mm/yyyy',
  dateDefault: 'dd/mm/yyyy',
  dateTZ: 'dd/mm/yyyy HH:mm:ss+hh:mm',
  dateTime: 'dd/mm/yyyy, hh:mm',
  ISO: `dd/mm/yyyy'T'HH:mm:ss'Z'`,
};
