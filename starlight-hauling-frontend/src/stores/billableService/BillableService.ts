import { computed } from 'mobx';

import { BillableItemActionEnum, BillingCycleEnum, ProrationTypeEnum } from '@root/consts';
import { BillableUnitType, IBillableService, IFrequency, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { BillableServiceStore } from './BillableServiceStore';
import { convertFrequencies } from './helper';

export class BillableService extends BaseEntity implements IBillableService {
  active: boolean;
  unit: BillableUnitType;
  description: string;
  action: BillableItemActionEnum;
  importCodes: string | null;
  equipmentItemId: number;
  applySurcharges: boolean;
  materialBasedPricing: boolean;
  allowForRecurringOrders: boolean;
  businessLineId: string;
  oneTime: boolean;
  spUsed: boolean;
  frequencies?: IFrequency[];
  services?: number[] | IBillableService[];
  billingCycles?: BillingCycleEnum[];
  prorationType?: ProrationTypeEnum;

  store: BillableServiceStore;

  constructor(store: BillableServiceStore, entity: JsonConversions<IBillableService>) {
    super(entity);

    this.store = store;
    this.action = entity.action;
    this.active = entity.active;
    this.description = entity.description;
    this.equipmentItemId = entity.equipmentItemId;
    this.importCodes = entity.importCodes;
    this.materialBasedPricing = entity.materialBasedPricing;
    this.allowForRecurringOrders = entity.allowForRecurringOrders;
    this.unit = entity.unit;
    this.businessLineId = entity.businessLineId;
    this.oneTime = entity.oneTime;
    this.frequencies = entity.frequencies?.map(convertFrequencies);
    this.services = entity.services as number[] | IBillableService[];
    this.billingCycles = entity.billingCycles;
    this.prorationType = entity.prorationType;
    this.applySurcharges = entity.applySurcharges;
    this.spUsed = entity.spUsed;
  }

  @computed
  get equipmentItem() {
    return this.store.globalStore.equipmentItemStore.getById(this.equipmentItemId);
  }
}
