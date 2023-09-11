import { startOfMonth } from 'date-fns';

import { convertDates, substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import {
  IDriverCost,
  ITruckAndDriverCost,
  ITruckCost,
  ITruckTypeCost,
  JsonConversions,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { TruckAndDriverCostStore } from './TruckAndDriverCostsStore';

export class TruckAndDriverCost extends BaseEntity implements ITruckAndDriverCost {
  businessUnitId: number | null;
  date: Date;
  changedBy: { id: string; name: string };
  averageCost: string;
  truckAverageCost: string;
  driverAverageCost: string;
  detailedCosts: boolean;
  store: TruckAndDriverCostStore;
  active?: boolean;
  truckTypeCosts?: ITruckTypeCost[];
  truckCosts?: ITruckCost[];
  driverCosts?: IDriverCost[];

  constructor(store: TruckAndDriverCostStore, entity: JsonConversions<ITruckAndDriverCost>) {
    super(entity);

    this.store = store;
    this.active = substituteLocalTimeZoneInsteadUTC(entity.date) >= startOfMonth(new Date());
    this.businessUnitId = entity.businessUnitId;
    this.date = substituteLocalTimeZoneInsteadUTC(entity.date);
    this.changedBy = entity.changedBy;
    this.averageCost = entity.averageCost;
    this.truckAverageCost = entity.truckAverageCost;
    this.driverAverageCost = entity.driverAverageCost;
    this.truckTypeCosts = entity.truckTypeCosts?.map(cost => convertDates(cost));
    this.truckCosts = entity.truckCosts?.map(cost => convertDates(cost));
    this.driverCosts = entity.driverCosts?.map(cost => convertDates(cost));
    this.detailedCosts = entity.detailedCosts;
  }
}
