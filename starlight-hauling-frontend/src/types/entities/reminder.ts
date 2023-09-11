import { InformByEnum } from '@root/consts';

import { IEntity } from './';

export const enum ReminderTypes {
  ProspectReminder = 'prospectReminder',
  AnnualEventReminder = 'annualEventReminder',
  OrderAnnualEventReminder = 'orderAnnualEventReminder',
}

export interface IConfigurableReminderSchedule {
  date: Date | null;
  informBy: Record<InformByEnum, boolean>;
  type?: ReminderTypes;
  customerId?: number;
  entityId?: number;
  id?: number;
}

export interface IReminderConfigPayload extends IEntity, Record<InformByEnum, boolean> {
  date: Date;
  type: ReminderTypes;
  customerId?: number;
  entityId?: number;
}

export interface IReminder extends IEntity {
  date: Date;
  type: ReminderTypes;
  entityId: number;
  customerId: number;
  jobSiteId: number;
  customerName: string;
  messageType: string;
  informedByAppAt: Date | null;
}
