import { ServiceDaysOfWeek } from '@root/common';

import { IEntity, IJobSite } from '.';
import { IHaulingSubscription } from './haulingSubscription';
import { IRouteItem } from './routeItem';

export interface IHaulingServiceItem extends IEntity, IRouteItem {
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
}
