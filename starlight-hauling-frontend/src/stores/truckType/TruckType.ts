import { parseDate } from '@root/helpers';
import { ITruckType, JsonConversions } from '@root/types';
import { IBusinessLineItem } from '@root/types/entities/truckType';

import { BaseEntity } from '../base/BaseEntity';

import { TruckTypeStore } from './TruckTypeStore';

export class TruckType extends BaseEntity implements ITruckType {
  active: boolean;
  description: string;
  businessLines: IBusinessLineItem[];
  businessLineNames?: string;
  store: TruckTypeStore;

  constructor(store: TruckTypeStore, entity: JsonConversions<ITruckType>) {
    super(entity);

    this.store = store;
    this.active = entity.active;
    this.description = entity.description;
    this.createdAt = parseDate(entity.createdAt);
    this.updatedAt = parseDate(entity.updatedAt);
    this.businessLines = entity.businessLines;
    this.businessLineNames = entity.businessLineNames;
  }
}
