import { ServiceDaysOfWeek } from '@root/common';
import { IHaulingServiceItem, IHaulingSubscription, IJobSite, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { HaulingServiceItemStore } from './HaulingServiceItemStore';

export class HaulingServiceItem extends BaseEntity implements IHaulingServiceItem {
  store: HaulingServiceItemStore;
  id: number;
  jobSiteId: number;
  businessLineId: number;
  materialId: number;
  subscriptionId: number;
  businessUnitId: number;
  customerId: number;
  serviceFrequencyId: number;
  startDate: Date | string;
  endDate: Date | string;
  serviceAreaId: number;
  equipmentItemId: number;
  billableServiceId: number;
  billableServiceDescription: string;
  bestTimeToComeFrom: Date | string;
  bestTimeToComeTo: Date | string;
  serviceDaysOfWeek?: ServiceDaysOfWeek;
  jobSite: IJobSite;
  subscription: IHaulingSubscription;

  constructor(store: HaulingServiceItemStore, entity: JsonConversions<IHaulingServiceItem>) {
    super(entity);

    this.store = store;
    this.id = entity.id;
    this.serviceFrequencyId = entity.serviceFrequencyId;
    this.jobSiteId = entity.jobSiteId;
    this.businessLineId = entity.businessLineId;
    this.materialId = entity.materialId;
    this.subscriptionId = entity.subscriptionId;
    this.businessUnitId = entity.businessUnitId;
    this.startDate = entity.startDate;
    this.endDate = entity.endDate;
    this.serviceAreaId = entity.serviceAreaId;
    this.equipmentItemId = entity.equipmentItemId;
    this.billableServiceId = entity.billableServiceId;
    this.billableServiceDescription = entity.billableServiceDescription;
    this.bestTimeToComeFrom = entity.bestTimeToComeFrom;
    this.bestTimeToComeTo = entity.bestTimeToComeTo;
    this.serviceDaysOfWeek = entity.serviceDaysOfWeek;
    this.jobSite = entity.jobSite;
    this.customerId = entity.customerId;
    this.subscription = entity.subscription;
  }
}
