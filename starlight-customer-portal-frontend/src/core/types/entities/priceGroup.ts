import { BillingCycle } from '@root/core/consts';
import {
  IBusinessContextIds,
  IFrequency,
  IRecurringLineItemBillingCycleRate,
} from '@root/core/types';

import type { ICustomer } from '../../../customer/types/entities/customer';

import type { BillableServiceActionType } from './billableService';
import type { ICustomerGroup } from './customerGroup';
import type { IEntity } from './entity';
import type { IJobSite } from './jobSite';
import { ThresholdSettingsType } from './threshold';

export interface IPriceGroup extends IEntity, IBusinessContextIds {
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  validDays: number[];
  active: boolean;
  overweightSetting: ThresholdSettingsType;
  usageDaysSetting: ThresholdSettingsType;
  demurrageSetting: ThresholdSettingsType;
  customerGroupId?: number;
  jobSiteId?: number;
  customerId?: number;
  serviceAreaIds?: number[];
  customer?: ICustomer | null;
  jobSite?: IJobSite | null;
  customerGroup?: ICustomerGroup | null;
}

export interface IPriceGroupRateService extends IBusinessContextIds {
  billableServiceId: number;
  materialId?: number;
  equipmentItemId?: number;
  value?: number | null;
  updatedAt?: Date;
  id?: number;
}

export interface IPriceGroupRateRecurringService
  extends IBusinessContextIds,
    ILineItemBillingCycleRate {
  action: BillableServiceActionType;
  billableServiceId: number;
  billingCycle: BillingCycle;
  equipmentItemId?: number;
  frequencies?: IFrequency[];
  globalRateId?: number;
  id?: number;
  materialId?: number;
  updatedAt?: Date;
}

export interface IPriceGroupRateLineItem extends IBusinessContextIds {
  lineItemId: number;
  value?: number | null;
  updatedAt?: Date;
  id?: number;
}

export interface ILineItemBillingCycleRate extends IRecurringLineItemBillingCycleRate {
  globalLimit?: number;
  finalPrice?: string;
  operation?: boolean;
  value?: string | null;
  displayValue?: string;
}

export interface IPriceGroupRateRecurringLineItem extends IBusinessContextIds {
  lineItemId: number;
  value?: number | null;
  updatedAt?: Date;
  id?: number;
  billingCycles: ILineItemBillingCycleRate[];
}

export type IPriceGroupRateGeneralLineItem = IPriceGroupRateLineItem | IPriceGroupRateLineItem;

export interface IRatesHistoryItem {
  attribute: string;
  id: number;
  newValue: number | string;
  previousValue: number | string | null;
  timestamp: Date;
  userId: string;
}

export interface IPriceGroupRateThreshold extends IBusinessContextIds {
  thresholdId: number;
  equipmentItemId?: number;
  materialId?: number;
  value?: number | null;
  limit?: number;
  updatedAt?: Date;
  id?: number;
}

export const enum RatesEntityType {
  globalRatesServices = 'globalRatesServices',
  globalRatesLineItems = 'globalRatesLineItems',
  globalRatesThresholds = 'globalRatesThresholds',
  globalThresholdsSetting = 'globalThresholdsSetting',
  customRatesServices = 'customRatesServices',
  customRatesLineItems = 'customRatesLineItems',
  customRatesThresholds = 'customRatesThresholds',
  customThresholdsSetting = 'customThresholdsSetting',
}
