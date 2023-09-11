import { parseDate } from '@root/helpers';
import { ReminderStore } from '@root/stores/reminder/ReminderStore';
import {
  IConfigurableReminderSchedule,
  IReminderConfigPayload,
  JsonConversions,
} from '@root/types';

export const sanitizeReminderConfig = (
  config: JsonConversions<IReminderConfigPayload>,
): IConfigurableReminderSchedule => ({
  id: config.id,
  type: config.type,
  date: parseDate(config.date),
  informBy: {
    informByApp: config.informByApp,
    informByEmail: config.informByEmail,
    informBySms: config.informBySms,
  },
});

export const prepareReminderConfigPayload = (
  config: IConfigurableReminderSchedule,
): Partial<IReminderConfigPayload> => ({
  id: config.id,
  type: config.type,
  date: parseDate(config.date),
  informByApp: config.informBy.informByApp,
  informByEmail: config.informBy.informByEmail,
  informBySms: config.informBy.informBySms,
  ...(config?.customerId && { customerId: config.customerId }),
  ...(config?.entityId && { entityId: config.entityId }),
});

export const reactionReminderSchedule = async (
  config: IConfigurableReminderSchedule,
  reminderStore: ReminderStore,
) => {
  if (!config.id && config?.date && config.customerId) {
    await reminderStore.createReminderSchedule(config);
  }

  if (config?.date && config?.id) {
    await reminderStore.updateReminderSchedule(config.id, config);
  }

  if (!config?.date && config?.id) {
    await reminderStore.deleteReminderSchedule(config.id);
  }
};
