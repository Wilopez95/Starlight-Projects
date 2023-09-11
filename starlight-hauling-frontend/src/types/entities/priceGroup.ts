import { BillableItemActionEnum, BillingCycleEnum } from '@root/consts';
import { IBusinessContextIds, IFrequency, IRecurringLineItemBillingCycleRate } from '@root/types';

import { type ICustomer } from './customer';
import { type ICustomerGroup } from './customerGroup';
import { type ICustomerJobSitePair } from './customerJobSitePair';
import { type IEntity } from './entity';
import { type IJobSite } from './jobSite';
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
  dumpSetting: ThresholdSettingsType;
  loadSetting: ThresholdSettingsType;
  customerGroupId?: number | null;
  customerJobSiteId?: number | null;
  customerId?: number | null;
  serviceAreaIds?: number[] | null;
  nonServiceHours?: boolean;
  spUsed: boolean;

  // Linked to Price Group entities
  customer?: ICustomer | null;
  jobSite?: IJobSite | null;
  customerJobSite?: ICustomerJobSitePair | null;
  customerGroup?: ICustomerGroup | null;
}

// TODO: fix this interface by making an id not optional and handle custom group id differently
export interface IPriceGroupRateService
  extends Partial<IEntity>,
    IBusinessContextIds,
    IFuturePrice {
  billableServiceId: number;
  materialId?: number | null;
  equipmentItemId?: number;
  price?: number | null;
}

export interface IPriceGroupRateRecurringService
  extends IBusinessContextIds,
    ILineItemBillingCycleRate {
  action: BillableItemActionEnum;
  billableServiceId: number;
  billingCycle: BillingCycleEnum;
  equipmentItemId?: number;
  frequencies?: IFrequency[];
  globalRateId?: number;
  id?: number;
  materialId?: number | null;
  updatedAt?: Date | string;
  effectiveDate?: Date | null;
}

export interface IPriceGroupRateLineItem extends IBusinessContextIds, IFuturePrice {
  lineItemId: number;
  price?: number | null;
  updatedAt?: Date;
  id?: number;
}

export interface IPriceGroupRateSurcharge extends IBusinessContextIds {
  surchargeId: number;
  price?: number | null;
  updatedAt?: Date;
  id?: number;
}

export interface ILineItemBillingCycleRate
  extends IRecurringLineItemBillingCycleRate,
    IFuturePrice {
  globalLimit?: number;
  finalPrice?: string;
  operation?: boolean;
  value?: string | null;
  displayValue?: string;
  price?: number | null;
}

export interface IPriceGroupRateRecurringLineItem extends IBusinessContextIds, IFuturePrice {
  lineItemId: number;
  billingCycles: ILineItemBillingCycleRate[];
  price?: number | null;
  updatedAt?: Date | string;
  id?: number;
  value?: string | null;
}

export interface IRatesHistoryItem {
  attribute: string;
  id: number;
  newValue: number | string;
  previousValue: number | string | null;
  timestamp: Date;
  userId: string;
  user: string;
}

export interface IPriceGroupRateThreshold extends IBusinessContextIds {
  thresholdId: number;
  equipmentItemId?: number;
  materialId?: number;
  price?: number | null;
  limit?: number;
  updatedAt?: Date;
  id?: number;
}

export const enum RatesEntityType {
  globalRatesServices = 'globalRatesServices',
  globalRatesLineItems = 'globalRatesLineItems',
  globalRatesRecurringServices = 'globalRatesRecurringServices',
  globalRatesRecurringLineItems = 'globalRatesRecurringLineItems',
  globalRatesThresholds = 'globalRatesThresholds',
  globalRatesSurcharges = 'globalRatesSurcharges',
  globalThresholdsSetting = 'globalThresholdsSetting',

  customRatesServices = 'customRatesServices',
  customRatesLineItems = 'customRatesLineItems',
  customRatesRecurringServices = 'customRatesRecurringServices',
  customRatesRecurringLineItems = 'customRatesRecurringLineItems',
  customRatesThresholds = 'customRatesThresholds',
  customRatesSurcharges = 'customRatesSurcharges',
  customThresholdsSetting = 'customThresholdsSetting',
}

export interface IFuturePrice {
  nextPrice?: number;
  effectiveDate?: Date | null;
}
