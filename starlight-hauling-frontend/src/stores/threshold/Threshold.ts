import { IThreshold, JsonConversions, ThresholdType, ThresholdUnitType } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { ThresholdStore } from './ThresholdStore';

export class Threshold extends BaseEntity implements IThreshold {
  type: ThresholdType;
  active: boolean;
  description: string;
  store: ThresholdStore;
  businessLineId: string;
  applySurcharges: boolean;
  unit: ThresholdUnitType;

  constructor(store: ThresholdStore, entity: JsonConversions<IThreshold>) {
    super(entity);

    this.store = store;
    this.active = true;
    this.type = entity.type;
    this.description = entity.description;
    this.businessLineId = entity.businessLineId;
    this.applySurcharges = entity.applySurcharges;
    this.unit = entity.unit;
  }
}
