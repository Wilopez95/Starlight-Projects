import { action, computed } from 'mobx';
import { createTransformer } from 'mobx-utils';

import { convertDates, substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import {
  type ICustomer,
  type ICustomerGroup,
  type ICustomerJobSitePair,
  type IJobSite,
  type IPriceGroup,
  type JsonConversions,
  type ThresholdSettingsType,
  type ThresholdType,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { PriceGroupStore } from './PriceGroupStore';

export class PriceGroup extends BaseEntity implements IPriceGroup {
  store: PriceGroupStore;
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
  businessLineId: string;
  businessUnitId: string;
  serviceAreaIds?: number[] | null;
  customerGroupId?: number | null;
  customerJobSiteId?: number | null;
  nonServiceHours?: boolean;
  customerId?: number | null;
  customer: ICustomer | null;
  jobSite: IJobSite | null;
  customerJobSite: ICustomerJobSitePair | null;
  customerGroup: ICustomerGroup | null;
  spUsed: boolean;

  constructor(store: PriceGroupStore, entity: JsonConversions<IPriceGroup>) {
    super(entity);

    this.store = store;
    this.description = entity.description;
    this.validDays = entity.validDays;
    this.active = entity.active;
    this.overweightSetting = entity.overweightSetting;
    this.usageDaysSetting = entity.usageDaysSetting;
    this.demurrageSetting = entity.demurrageSetting;
    this.loadSetting = entity.loadSetting;
    this.dumpSetting = entity.dumpSetting;

    this.businessLineId = entity.businessLineId;
    this.businessUnitId = entity.businessUnitId;

    this.nonServiceHours = entity.nonServiceHours;
    this.spUsed = entity.spUsed;
    this.customerGroupId = entity.customerGroupId ?? undefined;
    this.customerJobSiteId = entity.customerJobSiteId ?? undefined;
    this.customerId = entity.customerId ?? undefined;
    this.serviceAreaIds = entity.serviceAreaIds ?? undefined;
    this.customer = entity.customer ? convertDates(entity.customer) : null;
    this.jobSite = entity.jobSite ? convertDates(entity.jobSite) : null;
    this.customerGroup = entity.customerGroup ? convertDates(entity.customerGroup) : null;
    this.customerJobSite = entity.customerJobSite ? convertDates(entity.customerJobSite) : null;

    this.startDate = entity.startDate ? substituteLocalTimeZoneInsteadUTC(entity.startDate) : null;
    this.endDate = entity.endDate ? substituteLocalTimeZoneInsteadUTC(entity.endDate) : null;
  }

  @action
  setThresholdSetting(type: ThresholdType, setting: ThresholdSettingsType) {
    switch (type) {
      case 'demurrage':
        this.demurrageSetting = setting;
        break;
      case 'overweight':
        this.overweightSetting = setting;
        break;
      case 'usageDays':
        this.usageDaysSetting = setting;
        break;
      case 'dump':
        this.dumpSetting = setting;
        break;
      case 'load':
        this.loadSetting = setting;
        break;
      default:
    }
  }

  @computed
  get thresholdSetting() {
    return createTransformer((type: ThresholdType) => {
      switch (type) {
        case 'demurrage':
          return this.demurrageSetting;
        case 'overweight':
          return this.overweightSetting;
        case 'usageDays':
          return this.usageDaysSetting;
        case 'dump':
          return this.dumpSetting;
        case 'load':
          return this.loadSetting;
        default:
      }
    });
  }
}
