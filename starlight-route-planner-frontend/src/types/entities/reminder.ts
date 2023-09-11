import { IEntity } from './';

export const enum ReminderTypes {
  ProspectReminder = 'prospectReminder',
  AnnualEventReminder = 'annualEventReminder',
  OrderAnnualEventReminder = 'orderAnnualEventReminder',
}

export interface IConfigurableReminderSchedule {
  date: Date | null;
  informBy: {
    informByApp: boolean;
    informByEmail: boolean;
    informBySms: boolean;
  };
  type?: ReminderTypes;
  customerId?: number;
  entityId?: number;
  id?: number;
}

export interface IReminderConfigPayload extends IEntity {
  date: Date;
  type: ReminderTypes;
  informByApp: boolean;
  informByEmail: boolean;
  informBySms: boolean;
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
