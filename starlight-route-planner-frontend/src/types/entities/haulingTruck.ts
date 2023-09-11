import { BusinessLineTypeSymbol } from '../../consts/businessLine';

import { IEntity } from './entity';

export interface IHaulingTruck extends IEntity {
  name: string;
  type: string;
  truckTypeId: number;
  businessLineTypes?: BusinessLineTypeSymbol[];
  note?: string;
  licensePlate?: string;
  businessUnits?: number[];
}

export interface IHaulingTruckType extends IEntity {
  description: string;
  active: boolean;
}
