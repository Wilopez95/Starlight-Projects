import { BusinessLineType } from '@root/consts';
import { IBusinessLine, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { BusinessLineStore } from './BusinessLineStore';

export class BusinessLine extends BaseEntity implements IBusinessLine {
  store: BusinessLineStore;
  active: boolean;
  description: string;
  name: string;
  shortName: string;
  type: BusinessLineType;
  spUsed: boolean;
  billingCycle?: string;
  billingType?: string;

  constructor(store: BusinessLineStore, entity: JsonConversions<IBusinessLine>) {
    super(entity);

    this.store = store;
    this.active = entity.active;
    this.description = entity.description;
    this.name = entity.name;
    this.shortName = entity.shortName;
    this.type = entity.type;
    this.spUsed = entity.spUsed;
    this.billingCycle = entity.billingCycle;
    this.billingType = entity.billingType;
  }
}
