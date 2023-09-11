import { IHaulingDriver, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { HaulingDriverStore } from './HaulingDriverStore';

export class HaulingDriverItem extends BaseEntity implements IHaulingDriver {
  id: number;
  email?: string;
  name?: string;
  truckId?: number;
  truckName?: string;
  businessUnits?: number[];
  workingWeekdays?: number[];

  store: HaulingDriverStore;

  constructor(store: HaulingDriverStore, entity: JsonConversions<IHaulingDriver>) {
    super(entity);

    this.store = store;
    this.id = entity.id;
    this.email = entity.email;
    this.name = entity.name;
    this.truckId = entity.truckId;
    this.truckName = entity.truckName;
    this.businessUnits = entity.businessUnits;
    this.workingWeekdays = entity.workingWeekdays;
  }
}
