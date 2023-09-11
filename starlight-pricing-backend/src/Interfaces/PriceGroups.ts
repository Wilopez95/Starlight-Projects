import { FindOperator } from 'typeorm';
import { PriceGroups } from '../database/entities/tenant/PriceGroups';

export interface IWherePriceGroups extends PriceGroups {
  serviceAreaIds: number[];
}
export interface IArgsPriceGroups {
  serviceAreaIds: number | FindOperator<number> | undefined;
  id?: number;
  businessUnitId?: number;
  businessLineId?: number;
  customerGroupId?: number;
  customerId?: number;
  customerJobSiteId?: number;
  active?: boolean;
}
