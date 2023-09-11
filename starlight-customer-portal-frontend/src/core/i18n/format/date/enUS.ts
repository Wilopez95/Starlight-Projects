import { format } from 'date-fns';

import { IDateTimeFormatComponents } from '../../types';

export const formatDateEnUS = (locale: Locale) => (value: Date) => {
  return {
    time: format(value, 'h:mm a', { locale }),
    time24: format(value, 'HH:mm', { locale }),
    date: format(value, 'dd MMM, yyyy', { locale }),
    dateDefault: format(value, 'dd/mm/yyyy', { locale }),
    dateTZ: format(value, 'yyyy-MM-dd HH:mm:ss+hh:mm', { locale }),
    dateTime: format(value, 'dd MMM, yyyy, h:mm a', { locale }),
    ISO: format(value, "yyyy-MM-dd'T'HH:mm:ss'Z'", { locale }),
  };
};

export const dateFormatsEnUS: IDateTimeFormatComponents = {
  time: 'h:mm a',
  time24: 'HH:mm',
  date: 'dd MMM, yyyy',
  dateDefault: 'yyyy-MM-dd',
  dateTZ: 'yyyy-MM-dd HH:mm:ss+hh:mm',
  dateTime: 'dd MMM, yyyy, h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss'Z'",
};
