import { IHaulingTruck, JsonConversions } from '@root/types';

import { BusinessLineTypeSymbol } from '../../consts/businessLine';
import { BaseEntity } from '../base/BaseEntity';

import { HaulingTruckStore } from './HaulingTruckStore';

export class HaulingTruckItem extends BaseEntity implements IHaulingTruck {
  id: number;
  name: string;
  type: string;
  truckTypeId: number;
  businessLineTypes?: BusinessLineTypeSymbol[];
  note?: string;
  licensePlate?: string;
  businessUnits?: number[];

  store: HaulingTruckStore;

  constructor(store: HaulingTruckStore, entity: JsonConversions<IHaulingTruck>) {
    super(entity);

    this.store = store;
    this.id = entity.id;
    this.name = entity.name;
    this.type = entity.type;
    this.truckTypeId = entity.truckTypeId;
    this.note = entity.note;
    this.licensePlate = entity.licensePlate;
    this.businessUnits = entity.businessUnits;
    this.businessLineTypes = entity.businessLineTypes;
  }
}
