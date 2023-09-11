import { IEntity } from './entity';

export interface IBusinessUnitInfo {
  id: number;
  name: string;
}

export interface ITruckTypeInfo {
  id: number;
  description: string;
}

export interface ITruck extends IEntity {
  active: boolean;
  description: string;
  licensePlate: string;
  note: string;
  businessUnits: IBusinessUnitInfo[];
  businessUnitNames: string;
  truckType: ITruckTypeInfo;
}
export interface ITrucksFormikData extends Omit<IEntity, 'createdAt' | 'updatedAt'> {
  active: boolean;
  description: string;
  businessUnitIds: number[];
  licensePlate: string;
  note?: string;
  truckTypeId?: number;
}
