import { convertDates } from '@root/helpers';
import { JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { MasterRouteStore } from './MasterRouteStore';
import { IMasterRoute, IMasterRouteServiceItem, MusterRouteStatusEnum } from './types';

export class MasterRoute extends BaseEntity implements IMasterRoute {
  name: string;
  color: string;
  status: MusterRouteStatusEnum;
  numberOfStops: number;
  serviceDaysList: number[];
  assignedServiceDaysList: number[];
  serviceItems: IMasterRouteServiceItem[];

  constructor(store: MasterRouteStore, entity: JsonConversions<IMasterRoute>) {
    super(entity);

    this.name = entity.name;
    this.color = entity.color;
    this.status = entity.status;
    this.numberOfStops = entity.numberOfStops;
    this.serviceDaysList = entity.serviceDaysList;
    this.assignedServiceDaysList = entity.assignedServiceDaysList;
    this.serviceItems = entity.serviceItems.map(convertDates);
  }
}
