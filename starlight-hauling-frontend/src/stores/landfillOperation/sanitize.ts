import { format } from 'date-fns';

import { substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import { IEditableLandfillOperation } from '@root/types';

export const sanitizeEdit = (values: IEditableLandfillOperation) => {
  const { arrivalDate, timeIn, timeOut, departureDate, ...data } = values;
  const compareDateAndConvertToUTC = (date: Date, time: Date): string => {
    const comparedDateString = `${format(date, dateFormatsEnUS.dateDefault)}T${format(
      time,
      'hh:mm:ss',
    )}.000Z`;

    return substituteLocalTimeZoneInsteadUTC(comparedDateString).toISOString();
  };

  return {
    arrivalDate: compareDateAndConvertToUTC(arrivalDate, timeIn),
    departureDate: compareDateAndConvertToUTC(departureDate, timeOut),
    ...data,
  };
};
