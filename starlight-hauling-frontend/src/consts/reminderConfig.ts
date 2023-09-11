import { IConfigurableReminderSchedule } from '@root/types';

export const defaultReminderSchedule: IConfigurableReminderSchedule = {
  date: null,
  informBy: {
    informByApp: true,
    informByEmail: false,
    informBySms: false,
  },
};
