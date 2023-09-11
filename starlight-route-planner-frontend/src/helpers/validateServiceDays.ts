import { IHaulingServiceItem } from '@root/types';
import { ServiceDaysOfWeek } from '@root/common';

interface IValidateServiceDaysParams {
  droppedItems: IHaulingServiceItem[];
  serviceDays: number[];
}

interface IDayOfService {
  weekDay: number;
  requiredByCustomer: boolean;
  route?: string;
}

const nomalizedDaysOfService = (serviceDaysOfWeek: ServiceDaysOfWeek | undefined) => {
  const services: IDayOfService[] = [];

  if (serviceDaysOfWeek) {
    for (const key in serviceDaysOfWeek) {
      if (serviceDaysOfWeek.hasOwnProperty(key)) {
        services.push({
          weekDay: parseInt(key, 10),
          requiredByCustomer: serviceDaysOfWeek[key].requiredByCustomer,
          route: serviceDaysOfWeek[key].route,
        });
      }
    }
    return services;
  } else {
    return services;
  }
};

export const validateServiceDays = ({ droppedItems, serviceDays }: IValidateServiceDaysParams) => {
  // Filters the droppedItems array based on whether the service do NOT have a match day on the serviceDays array

  const filteredInvalidServiceByServiceDays: IHaulingServiceItem[] = [];

  for (let i = 0; i < droppedItems.length; i++) {
    const item = droppedItems[i];

    //If the service do not have service days, pass it
    if (!item.serviceDaysOfWeek) {
      continue;
    }

    const daysOfService = nomalizedDaysOfService(item.serviceDaysOfWeek);

    //Is in service days and is not required by customer
    const isInServiceDays: boolean = daysOfService.some(
      day => serviceDays.includes(day.weekDay) && !day.requiredByCustomer,
    );

    //If is not in services add to invalid array
    if (!isInServiceDays) {
      filteredInvalidServiceByServiceDays.push(item);
    }
  }

  return filteredInvalidServiceByServiceDays;
};
