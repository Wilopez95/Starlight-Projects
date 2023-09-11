import { ISelectOption } from '@starlightpro/shared-components';
import { capitalize } from 'lodash-es';

import { IServiceDayOfWeek } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export const getAvailableServiceDayOptions = (
  serviceDaysOfWeek: IServiceDayOfWeek[],
  weekDays: Record<string, number>,
) =>
  Object.keys(weekDays).reduce(
    (options: ISelectOption[], weekDay) =>
      serviceDaysOfWeek.find(({ day }) => day === weekDay)
        ? options
        : [...options, { value: weekDay, label: capitalize(weekDay) }],
    [],
  );
