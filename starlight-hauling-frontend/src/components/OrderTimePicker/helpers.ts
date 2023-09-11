import { format } from 'date-fns';
import { isDate } from 'lodash-es';

import { dateFormatsEnUS } from '@root/i18n/format/date';

import {
  amTimeFrom,
  amTimeTo,
  eveningDateTime,
  midnightDateTime,
  pmTimeFrom,
  pmTimeTo,
} from './constants';
import { BestTimeToCome, TimeOfDay } from './types';

export const isTimeAfter = (time1: string, time2: string): boolean => {
  const time1Parts = time1.split(':');
  const time2Parts = time2.split(':');

  const time1InMinutes = parseFloat(time1Parts[0]) * 60 + parseFloat(time1Parts[1]);
  const time2InMinutes = parseFloat(time2Parts[0]) * 60 + parseFloat(time2Parts[1]);

  return time1InMinutes < time2InMinutes;
};

export const determinePartOfDay = (
  bestTimeToComeFrom: string | null,
  bestTimeToComeTo: string | null,
): BestTimeToCome => {
  if (bestTimeToComeFrom === TimeOfDay.AmFrom && bestTimeToComeTo === TimeOfDay.AmTo) {
    return 'am';
  } else if (bestTimeToComeFrom === TimeOfDay.PmFrom && bestTimeToComeTo === TimeOfDay.PmTo) {
    return 'pm';
  } else if (bestTimeToComeFrom === null && bestTimeToComeTo === null) {
    return 'any';
  } else {
    return 'specific';
  }
};

export const formatBestTimeToCome = (
  bestTimeToComeFromValue: string | Date | null,
  bestTimeToComeToValue: string | Date | null,
) => {
  const bestTimeToComeFrom = isDate(bestTimeToComeFromValue)
    ? format(bestTimeToComeFromValue, dateFormatsEnUS.time24)
    : bestTimeToComeFromValue;
  const bestTimeToComeTo = isDate(bestTimeToComeToValue)
    ? format(bestTimeToComeToValue, dateFormatsEnUS.time24)
    : bestTimeToComeToValue;

  const bestTimeToCome = determinePartOfDay(bestTimeToComeFrom, bestTimeToComeTo);

  return {
    bestTimeToCome,
    bestTimeToComeFrom,
    bestTimeToComeTo,
  };
};

export const getBestTimeToComeFromAndTo = (bestTimeToCome: BestTimeToCome) => {
  if (bestTimeToCome === 'any') {
    return { bestTimeToComeFrom: null, bestTimeToComeTo: null };
  }

  if (bestTimeToCome === 'am') {
    return { bestTimeToComeFrom: amTimeFrom, bestTimeToComeTo: amTimeTo };
  }

  if (bestTimeToCome === 'pm') {
    return { bestTimeToComeFrom: pmTimeFrom, bestTimeToComeTo: pmTimeTo };
  }

  return { bestTimeToComeFrom: midnightDateTime, bestTimeToComeTo: eveningDateTime };
};
