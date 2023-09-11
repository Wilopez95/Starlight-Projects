import { ParsedDaysList, ServiceDaysOfWeek, ServiceDaysOfWeekValue, Status } from './types';

export const formatAssignedServiceDaysList = (
  serviceDaysList: number[],
  assignedServiceDaysList: number[],
): ParsedDaysList => {
  return serviceDaysList.reduce<ParsedDaysList>((acc, day) => {
    acc[day] = {
      value: day,
      type: assignedServiceDaysList.includes(day) ? Status.active : Status.inactive,
    };

    return acc;
  }, {});
};

export const formatServiceDaysOfWeek = (serviceDaysOfWeek: ServiceDaysOfWeek) => {
  const parsed: ParsedDaysList = {};
  const serviceDaysOfWeekArray = Object.keys(serviceDaysOfWeek);
  if (serviceDaysOfWeekArray.length > 0) {
    for (const day in serviceDaysOfWeek) {
      if (day) {
        const serviceDay: ServiceDaysOfWeekValue = serviceDaysOfWeek[day];

        //const isServiceDay = !!serviceDay;
        const isAssigned = serviceDay.route !== undefined && !!serviceDay.route;
        let type = Status.inactive;

        if (isAssigned) {
          //(isServiceDay && isAssigned) is "isService" was always true
          type = Status.active;
        }

        parsed[day] = {
          type,
          value: +day,
          requiredByCustomer: serviceDaysOfWeek[day].requiredByCustomer, // "isService" was always true
          route: serviceDay.route,
          isAssigned,
        };
      }
    }
    return parsed;
  } else {
    return parsed;
  }
};
