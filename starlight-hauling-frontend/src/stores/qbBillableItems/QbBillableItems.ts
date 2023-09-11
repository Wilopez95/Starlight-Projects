import { type JsonConversions, IQbBillableItems } from '@root/types';
import { BaseEntity } from '../base/BaseEntity';
import { QbBillableItemsStore } from './QbBillableItemsStore';

export class QbBillableItems extends BaseEntity implements IQbBillableItems {
  store: QbBillableItemsStore;

  configurationId: number;

  description: string;

  type: string;

  customerGroup: string;

  customerGroupId: number;

  accountName: string;

  districtType: string;

  lineOfBussinessId: number;

  subscriptionBillingCycle: number;

  materialId: number;

  equipmentId: number;

  paymentMethodId: string;

  districtId: number;

  constructor(store: QbBillableItemsStore, entity: JsonConversions<IQbBillableItems>) {
    super(entity);
    this.store = store;
    this.configurationId = entity.configurationId;
    this.description = entity.description;
    this.type = entity.type;
    this.customerGroup = entity.customerGroup;
    this.customerGroupId = entity.customerGroupId;
    this.accountName = entity.accountName;
    this.districtType = entity.districtType;
    this.lineOfBussinessId = entity.lineOfBussinessId;
    this.subscriptionBillingCycle = entity.subscriptionBillingCycle;
    this.materialId = entity.materialId;
    this.equipmentId = entity.equipmentId;
    this.paymentMethodId = entity.paymentMethodId;
    this.districtId = entity.districtId;
  }
}
