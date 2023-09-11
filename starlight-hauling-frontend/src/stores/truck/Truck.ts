import { parseDate } from '@root/helpers';
import { IBusinessUnitInfo, ITruck, ITruckTypeInfo, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { TruckStore } from './TruckStore';

export class Truck extends BaseEntity implements ITruck {
  active: boolean;
  description: string;
  licensePlate: string;
  note: string;
  businessUnits: IBusinessUnitInfo[];
  businessUnitNames: string;
  truckType: ITruckTypeInfo;
  store: TruckStore;

  constructor(store: TruckStore, entity: JsonConversions<ITruck>) {
    super(entity);

    this.store = store;
    this.active = entity.active;
    this.description = entity.description;
    this.licensePlate = entity.licensePlate;
    this.note = entity.note;
    this.businessUnits = entity.businessUnits;
    this.businessUnitNames = entity.businessUnitNames;
    this.truckType = entity.truckType;

    this.createdAt = parseDate(entity.createdAt);
    this.updatedAt = parseDate(entity.updatedAt);
  }
}
