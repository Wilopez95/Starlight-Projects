import { isValid, parse, startOfDay } from 'date-fns';

export const parseCalendarDate = (date: string, formatString: string) => {
  let result = parse(date, formatString, new Date());

  if (isValid(result)) {
    return result;
  }

  result = startOfDay(new Date(date));

  if (isValid(result)) {
    return result;
  }

  return undefined;
};
