import { ServiceDaysOfWeek } from '@root/common';

export interface IServiceItemsDataTable {
  id: number;
  frequency: string;
  time: string;
  serviceType?: string;
  materialType?: string;
  equipmentSize?: string;
  serviceDaysOfWeek?: ServiceDaysOfWeek;
}
