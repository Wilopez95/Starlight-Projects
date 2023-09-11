import { differenceInCalendarDays, startOfToday } from 'date-fns';

export const isPastDate = (date: Date) => differenceInCalendarDays(date, startOfToday()) < 0;
