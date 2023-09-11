import { convertDates } from '@root/helpers';
import { IBusinessLine, JsonConversions } from '@root/types';
import { IChangeReason } from '@root/types/entities';

import { BaseEntity } from '../base/BaseEntity';

import { ChangeReasonStore } from './ChangeReasonStore';

export class ChangeReason extends BaseEntity implements IChangeReason {
  active: boolean;
  description: string;
  businessLines: IBusinessLine[];
  businessLineNames: string;

  constructor(store: ChangeReasonStore, entity: JsonConversions<IChangeReason>) {
    super(entity);

    this.active = entity.active;
    this.description = entity.description;
    this.businessLines = entity.businessLines.map(convertDates);
    this.businessLineNames = entity.businessLineNames;
  }
}
