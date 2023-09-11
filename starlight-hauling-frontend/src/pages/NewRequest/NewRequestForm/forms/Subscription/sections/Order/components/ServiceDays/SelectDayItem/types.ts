import { ISelectOption } from '@starlightpro/shared-components';

import { IServiceDayOfWeek } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export interface ISelectFrequencyDayItem {
  index: number;
  serviceDayOfWeek: IServiceDayOfWeek;
  serviceDaysPropsPath: string;
  availableDayOptions: ISelectOption[];
  isReadOnly?: boolean;
}
