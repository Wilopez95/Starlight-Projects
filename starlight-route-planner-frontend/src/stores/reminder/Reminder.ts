import { parseDate } from '@root/helpers';
import { IReminder, JsonConversions, ReminderTypes } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { ReminderStore } from './ReminderStore';

export class Reminder extends BaseEntity implements IReminder {
  type: ReminderTypes;
  entityId: number;
  customerId: number;
  jobSiteId: number;
  customerName: string;
  messageType: string;
  date: Date;
  informedByAppAt: Date | null;
  store: ReminderStore;

  constructor(store: ReminderStore, entity: JsonConversions<IReminder>) {
    super(entity);

    this.type = entity.type;
    this.entityId = entity.entityId;
    this.customerId = entity.customerId;
    this.jobSiteId = entity.jobSiteId;
    this.customerName = entity.customerName;
    this.date = parseDate(entity.date);
    this.messageType = entity.messageType;
    this.informedByAppAt = entity.informedByAppAt ? parseDate(entity.informedByAppAt) : null;
    this.store = store;
  }
}
