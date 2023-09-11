import { IEntity } from './entity';

export interface IBasicData {
  label: string;
  value: number | string;
  type?: string;
}

export interface ISubscriptionBillingCycleOptions {
  label: string;
  value: number;
}

export interface IPaymentMethodsOptions {
  label: string;
  value: string;
}
export interface IQbBillableItemsData {
  id?: number | string;
  description?: string;
  subscriptionBillingCycleName?: string;
  subscriptionBillingCycle?: number | string;
  lineOfBussiness?: string;
  lineOfBussinessId?: number | string;
  material?: string;
  materialId?: number | string;
  equipment?: string;
  equipmentId?: number | string;
  customerGroup?: string;
  customerGroupId?: number | string;
  type: string;
  paymentMethodId?: string;
  districtType?: string;
  districtId?: number;
}
export interface IQbBillableItemsortedAccounts {
  paymentMethodId?: string;
  id?: number | string;
  accountName: string;
  billableItems?: IQbBillableItemsData[];
}

export interface IQbBillableItems extends IEntity {
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
}
