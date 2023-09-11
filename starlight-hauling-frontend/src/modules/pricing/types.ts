import { BillingCycleEnum } from '@root/consts';
import {
  IBusinessContextIds,
  ICustomer,
  ICustomerGroup,
  ICustomerJobSitePair,
  IEntity,
  IJobSite,
  IServiceArea,
  ThresholdSettingsType,
} from '@root/types';

import { RatesEntityType } from './const';

export interface IPriceGroup extends IEntity, IBusinessContextIds {
  active: boolean;
  description: string;
  startAt: Date | null;
  endAt: Date | null;
  validDays: number[];
  dumpSetting: 'material';
  loadSetting: 'material';
  // spUsed: boolean;
  nonServiceHours?: boolean;
  overweightSetting?: ThresholdSettingsType;
  usageDaysSetting?: ThresholdSettingsType;
  demurrageSetting?: ThresholdSettingsType;
  customerGroupId?: number;
  customerId?: number;
  customerJobSiteId?: number;
  serviceAreasIds?: number[];

  // Linked to Price Group entities
  customer?: ICustomer | null;
  jobSite?: IJobSite | null;
  customerJobSite?: ICustomerJobSitePair | null;
  customerGroup?: ICustomerGroup | null;
  serviceAreas?: IServiceArea[] | null;
}

export interface IRatesHistoryRequest extends IBusinessContextIds {
  entityType: RatesEntityType;
  lineItemId?: number;
  billableServiceId?: number;
  materialId?: number | null;
  equipmentItemId?: number;
  thresholdId?: number;
  surchargeId?: number;
  customRatesGroupId?: number;
  billingCycle?: BillingCycleEnum | null;
  frequencyId?: number;
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

export interface IRatesFilterParameters {
  billableServiceId?: number;
  billableLineItemId?: number;
  materialId?: number | null;
  equipmentItemId?: number;
  thresholdId?: number;
  surchargeId?: number;
}
