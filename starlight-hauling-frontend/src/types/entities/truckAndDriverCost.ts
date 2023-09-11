import { IEntity } from './entity';

export interface ITruckTypeCost extends Omit<IEntity, 'id'> {
  truckTypeId?: number;
  truckAverageCost?: number | null;
  fuelCost?: number | null;
  miscAverageCost?: number | null;
  insuranceCost?: number | null;
  maintenanceCost?: number | null;
  depreciationCost?: number | null;
}

export interface ITruckCost extends Omit<ITruckTypeCost, 'truckTypeId'> {
  truckId?: number;
}

export interface IDriverCost extends Omit<IEntity, 'id'> {
  driverId?: number;
  driverAverageCost?: number | null;
}
export interface ITruckAndDriverCost extends IEntity {
  averageCost: string;
  businessUnitId: number | null;
  changedBy: { id: string; name: string };
  date: Date;
  detailedCosts: boolean;
  driverAverageCost: string;
  id: number;
  truckAverageCost: string;
  active?: boolean;
  truckTypeCosts?: Array<ITruckTypeCost> | null;
  truckCosts?: Array<ITruckCost> | null;
  driverCosts?: Array<IDriverCost> | null;
}
