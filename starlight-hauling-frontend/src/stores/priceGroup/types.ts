import {
  IBusinessContextIds,
  ICustomer,
  IEntity,
  IJobSite,
  IPriceGroup,
  ThresholdSettingsType,
} from '@root/types';

export interface IRequestSpecificOptions {
  businessUnitId: string;
  customerGroupId?: number;
  customerId?: number;
  customerJobSiteId?: number;
}

export interface IUpdateThresholdsRequest {
  overweightSetting: ThresholdSettingsType;
  usageDaysSetting: ThresholdSettingsType;
  demurrageSetting: ThresholdSettingsType;
}

export interface ITargetedPriceGroups extends IEntity {
  description: string;
  customerGroup?: IPriceGroup;
  customer?: ICustomer;
  jobSite?: IJobSite;
}

export interface IRequestPriceGroupsOptions extends IBusinessContextIds {
  type?: string;
}

export type PriceGroupSortType = 'id' | 'status' | 'startDate' | 'endDate' | 'description';
