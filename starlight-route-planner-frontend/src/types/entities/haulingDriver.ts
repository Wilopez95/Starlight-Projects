import { IEntity } from './entity';

export interface IHaulingDriver extends IEntity {
  email?: string;
  name?: string;
  truckId?: number;
  truckName?: string;
  businessUnits?: number[];
  workingWeekdays?: number[];
}
