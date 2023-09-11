import { IReminder, IReminderConfigPayload, ReminderTypes } from '@root/types';

import { BaseService, haulingHttpClient } from '../base';

export class ReminderService extends BaseService<IReminderConfigPayload> {
  constructor() {
    super('reminders');
  }

  getReminderSchedule(type: ReminderTypes, reminderId: number) {
    return haulingHttpClient.get<number, IReminderConfigPayload>(
      `${this.baseUrl}?type=${type}&entityId=${reminderId}`,
    );
  }

  getAllUserReminders({ skip, limit }: { skip: number; limit: number }) {
    return haulingHttpClient.get<IReminder[]>(`${this.baseUrl}/user?skip=${skip}&limit=${limit}`);
  }

  deleteAllUserReminders() {
    return haulingHttpClient.delete(`${this.baseUrl}/user`);
  }

  updateUserReminder(reminderId: number, informedByAppAt?: Date) {
    return haulingHttpClient.put<IReminder>({
      url: `${this.baseUrl}/user/${reminderId}`,
      data: { informedByAppAt },
    });
  }

  deleteUserReminder(reminderId: number) {
    return haulingHttpClient.delete(`${this.baseUrl}/user/${reminderId}`);
  }
}
