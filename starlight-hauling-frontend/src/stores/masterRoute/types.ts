import { IEntity, IServiceDaysOfWeek } from '@root/types';

export interface IMasterRoute extends IEntity {
  name: string;
  color: string;
  status: MusterRouteStatusEnum;
  numberOfStops: number;
  serviceDaysList: number[];
  assignedServiceDaysList: number[];
  serviceItems: IMasterRouteServiceItem[];
}

export enum MusterRouteStatusEnum {
  active = 'ACTIVE',
  editing = 'EDITING',
}

export interface IMasterRouteServiceItem extends IEntity {
  serviceDaysOfWeek: IServiceDaysOfWeek;
  jobSite: {
    coordinates: number[];
  };
}
