import { SurchargeCalculation } from '@root/consts';
import { ISurcharge, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { SurchargeStore } from './SurchargeStore';

export class Surcharge extends BaseEntity implements ISurcharge {
  calculation: SurchargeCalculation;
  active: boolean;
  description: string;
  businessLineId: string;
  materialBasedPricing?: boolean;
  store: SurchargeStore;

  constructor(store: SurchargeStore, entity: JsonConversions<ISurcharge>) {
    super(entity);

    this.store = store;
    this.calculation = entity.calculation;
    this.active = entity.active;
    this.description = entity.description;
    this.businessLineId = entity.businessLineId;
    this.materialBasedPricing = entity.materialBasedPricing;
  }
}
