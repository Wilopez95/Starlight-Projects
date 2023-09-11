import { BusinessLineType } from '@root/core/consts';
import { IBusinessLine, JsonConversions } from '@root/core/types';

import { BaseEntity } from '../base/BaseEntity';

import { BusinessLineStore } from './BusinessLineStore';

export class BusinessLine extends BaseEntity implements IBusinessLine {
  store: BusinessLineStore;
  active: boolean;
  description: string;
  name: string;
  type: BusinessLineType;

  constructor(store: BusinessLineStore, entity: JsonConversions<IBusinessLine>) {
    super(entity);

    this.store = store;
    this.active = entity.active;
    this.description = entity.description;
    this.name = entity.name;
    this.type = entity.type;
  }
}
