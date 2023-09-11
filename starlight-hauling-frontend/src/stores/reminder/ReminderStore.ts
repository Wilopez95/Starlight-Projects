import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { ReminderService } from '@root/api';
import { NotificationHelper } from '@root/helpers';
import { IConfigurableReminderSchedule, ReminderTypes } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { prepareReminderConfigPayload, sanitizeReminderConfig } from './helpers';
import { Reminder } from './Reminder';

export class ReminderStore extends BaseStore<Reminder> {
  private readonly service: ReminderService;

  @observable currentReminderConfig: IConfigurableReminderSchedule | null = null;

  constructor(global: GlobalStore) {
    super(global);

    this.service = new ReminderService();
  }

  @actionAsync
  async createReminderSchedule(reminderConfig: IConfigurableReminderSchedule) {
    this.loading = true;

    try {
      const configPayload = prepareReminderConfigPayload(reminderConfig);
      const reminderSchedule = await task(this.service.create(configPayload));

      NotificationHelper.success('create', `Reminder schedule #${reminderSchedule.id}`);

      const sanitizedReminderConfig = sanitizeReminderConfig(reminderSchedule);

      this.setReminderConfig(sanitizedReminderConfig);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError.response.code as ActionCode, 'Reminder');
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async updateReminderSchedule(reminderId: number, reminderConfig: IConfigurableReminderSchedule) {
    this.loading = true;

    try {
      const configPayload = prepareReminderConfigPayload(reminderConfig);
      const reminderSchedule = await task(this.service.update(reminderId, configPayload));

      NotificationHelper.success('update', `Reminder schedule #${reminderSchedule.id}`);

      const sanitizedReminderConfig = sanitizeReminderConfig(reminderSchedule);

      this.setReminderConfig(sanitizedReminderConfig);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async deleteReminderSchedule(id: number) {
    this.loading = true;

    try {
      await task(this.service.delete(id));

      NotificationHelper.success('delete', `Reminder schedule #${id}`);

      this.setReminderConfig(null);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async getReminderScheduleBy(id: number, type: ReminderTypes) {
    this.clearConfig();

    this.loading = true;

    try {
      const reminderSchedule = await task(this.service.getReminderSchedule(type, id));

      if (reminderSchedule?.id) {
        const sanitizedReminderConfig = sanitizeReminderConfig(reminderSchedule);

        this.setReminderConfig(sanitizedReminderConfig);

        return sanitizedReminderConfig;
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async getAllUserReminders() {
    this.loading = true;

    const options = { limit: this.limit, skip: this.offset };

    try {
      const reminders = await task(this.service.getAllUserReminders(options));

      this.validateLoading(reminders, this.limit);

      this.setItems(reminders.map(reminder => new Reminder(this, reminder)));
      this.offset += this.limit;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async clearAllUserReminders() {
    this.cleanup();
    this.loading = true;

    try {
      await task(this.service.deleteAllUserReminders());

      NotificationHelper.success('delete', `Reminders`);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async markUserReminderAsRead(id: number) {
    const userReminder = this.values.find(reminder => reminder.id === id);
    const isMarkedAsRead = userReminder?.informedByAppAt;

    if (userReminder && !isMarkedAsRead) {
      this.loading = true;

      try {
        const currentDate = new Date();
        const reminder = await task(this.service.updateUserReminder(id, currentDate));

        this.setItem(
          new Reminder(this, {
            ...reminder,
            entityId: userReminder.entityId,
            customerId: userReminder.customerId,
            customerName: userReminder.customerName,
            date: reminder.createdAt,
            type: userReminder.type,
          }),
        );
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('default', typedError.response.code as ActionCode);
      } finally {
        this.loading = false;
      }
    }
  }

  @actionAsync
  async removeUserReminder(id: number) {
    this.loading = true;

    try {
      await task(this.service.deleteUserReminder(id));

      this.removeEntity(id);
      NotificationHelper.success('deleteNotification');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    } finally {
      this.loading = false;
    }
  }

  @action.bound
  setReminderConfig(config: IConfigurableReminderSchedule | null) {
    this.currentReminderConfig = config;
  }

  @action.bound
  clearConfig() {
    this.currentReminderConfig = null;
  }

  @computed
  get hasUnreadReminders() {
    return this.values.some(reminder => !reminder.informedByAppAt);
  }
}
