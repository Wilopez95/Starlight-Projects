import { format } from 'date-fns';

import { IDateTimeFormatComponents } from '../../types';

export const formatDateFrCA = (locale: Locale) => (value: Date) => {
  return {
    time: format(value, `h 'h' mm a`, { locale }),
    time24: format(value, `hh 'h' mm`, { locale }),
    date: format(value, 'yyyy-MM-dd', { locale }),
    dateDefault: format(value, 'dd/mm/yyyy', { locale }),
    dateTZ: format(value, `yyyy-MM-dd HH 'h' mm:ss+hh:mm`, { locale }),
    dateTime: format(value, `yyyy-MM-dd hh 'h' mm`, { locale }),
    ISO: format(value, "yyyy-MM-dd'T'HH:mm:ss'Z'", { locale }),
  };
};

export const dateFormatsFrCA: IDateTimeFormatComponents = {
  time: `h 'h' mm a`,
  time24: `hh 'h' mm`,
  date: 'yyyy-MM-dd',
  dateDefault: 'yyyy-MM-dd',
  dateTZ: `yyyy-MM-dd HH 'h' mm:ss+hh:mm`,
  dateTime: `yyyy-MM-dd hh 'h' mm`,
  ISO: `yyyy-MM-dd'T'HH:mm:ss'Z'`,
};
