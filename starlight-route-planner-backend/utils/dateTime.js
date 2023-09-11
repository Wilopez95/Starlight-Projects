import dateFns from 'date-fns';

import { WEEK_STARTS_FROM_SUNDAY } from '../config.js';

// dateFns.getDay returns 0-6, dateFns.getISODay returns 1-7
export const getWeekDay = date => {
  if (WEEK_STARTS_FROM_SUNDAY) {
    return dateFns.getDay(date);
  } else {
    // subtract 1 since ISO weekdays are 1-7, not 0-6
    return dateFns.getISODay(date) - 1;
  }
};
