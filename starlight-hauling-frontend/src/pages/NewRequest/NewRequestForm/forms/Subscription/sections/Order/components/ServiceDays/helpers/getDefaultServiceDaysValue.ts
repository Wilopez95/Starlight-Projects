import { IntlConfig } from '@root/i18n/types';
import { IServiceDayOfWeek } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export const getDefaultServiceDaysValue = (times: number, { weekDays }: IntlConfig) =>
  Object.keys(weekDays)
    .slice(0, times)
    .reduce(
      (defaultServiceDays: IServiceDayOfWeek[], day) => [
        ...defaultServiceDays,
        {
          day,
          requiredByCustomer: false,
        },
      ],
      [],
    );
