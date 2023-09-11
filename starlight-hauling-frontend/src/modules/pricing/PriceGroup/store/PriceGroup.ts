import { action, computed } from 'mobx';
import { createTransformer } from 'mobx-utils';

import { convertDates, substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { BaseEntity } from '@root/stores/base/BaseEntity';
import {
  type ICustomer,
  type ICustomerGroup,
  type ICustomerJobSitePair,
  type IJobSite,
  type IServiceArea,
  type JsonConversions,
  type ThresholdSettingsType,
  type ThresholdType,
} from '@root/types';

import { IPriceGroup } from '../../types';

import { PriceGroupStoreNew } from './PriceGroupStore';

export class PriceGroup extends BaseEntity implements IPriceGroup {
  store: PriceGroupStoreNew;
  description: string;
  businessLineId: string;
  businessUnitId: string;
  startAt: Date | null;
  endAt: Date | null;
  validDays: number[];
  active: boolean;
  overweightSetting?: ThresholdSettingsType;
  usageDaysSetting?: ThresholdSettingsType;
  demurrageSetting?: ThresholdSettingsType;
  dumpSetting: 'material';
  loadSetting: 'material';
  customer: ICustomer | null;
  jobSite: IJobSite | null;
  customerJobSite: ICustomerJobSitePair | null;
  customerGroup: ICustomerGroup | null;
  serviceAreas: IServiceArea[] | null;
  // spUsed: boolean;
  serviceAreasIds?: number[];
  customerGroupId?: number;
  customerJobSiteId?: number;
  nonServiceHours?: boolean;
  customerId?: number;

  constructor(store: PriceGroupStoreNew, entity: JsonConversions<IPriceGroup>) {
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
    // this.spUsed = entity.spUsed;
    this.customerGroupId = entity.customerGroupId ?? undefined;
    this.customerJobSiteId = entity.customerJobSiteId ?? undefined;
    this.customerId = entity.customerId ?? undefined;
    this.serviceAreasIds = entity.serviceAreasIds ?? undefined;
    this.customer = entity.customer ? convertDates(entity.customer) : null;
    this.jobSite = entity.jobSite ? convertDates(entity.jobSite) : null;
    this.customerGroup = entity.customerGroup ? convertDates(entity.customerGroup) : null;
    this.customerJobSite = entity.customerJobSite ? convertDates(entity.customerJobSite) : null;
    this.serviceAreas = entity.serviceAreas ? entity.serviceAreas.map(convertDates) : null;

    this.startAt = entity.startAt ? substituteLocalTimeZoneInsteadUTC(entity.startAt) : null;
    this.endAt = entity.endAt ? substituteLocalTimeZoneInsteadUTC(entity.endAt) : null;
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
        this.dumpSetting = 'material';
        break;
      case 'load':
        this.loadSetting = 'material';
        break;
      default:
        return null;
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
          return null;
      }
    });
  }
}
