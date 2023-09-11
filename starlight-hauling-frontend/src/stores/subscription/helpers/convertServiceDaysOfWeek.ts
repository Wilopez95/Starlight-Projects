import { convertToMondayZeroBase, sundayFirstLocals } from '@root/i18n/helpers';
import { I18nStore } from '@root/i18n/I18nStore';
import { IServiceDayOfWeek } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { IServiceDaysOfWeek } from '@root/types';

export const convertServiceDaysOfWeek = (
  serviceDaysOfWeek: IServiceDayOfWeek[],
  i18nStore: I18nStore,
): IServiceDaysOfWeek => {
  const { intlConfig } = i18nStore;

  const weekDaysBase = sundayFirstLocals.includes(i18nStore.region)
    ? convertToMondayZeroBase(intlConfig.weekDays)
    : intlConfig.weekDays;

  return serviceDaysOfWeek.reduce(
    (map: IServiceDaysOfWeek, { day, route, requiredByCustomer }) => ({
      ...map,
      [weekDaysBase[day]]: { route, requiredByCustomer },
    }),
    {},
  );
};
