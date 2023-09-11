import { format } from 'date-fns';

import { dateFormatsEnUS } from '@root/i18n/format/date';
import { IBusinessContextIds, IGlobalRate } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

export class GlobalRate extends BaseEntity implements IGlobalRate, IBusinessContextIds {
  businessUnitId: string;
  businessLineId: string;
  active: boolean;
  customerGroup: string;
  description: string;
  dateStart?: Date;
  dateEnd?: Date;

  constructor() {
    super({
      id: 0,
      createdAt: format(new Date(), dateFormatsEnUS.ISO),
      updatedAt: format(new Date(), dateFormatsEnUS.ISO),
    });
    this.businessUnitId = '';
    this.businessLineId = '';
    this.active = true;
    this.customerGroup = 'All Customers';
    this.dateStart = undefined;
    this.dateEnd = undefined;
    this.description = 'General Price Group';
  }
}
