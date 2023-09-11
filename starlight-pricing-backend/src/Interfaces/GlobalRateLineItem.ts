import { IEntity } from './Entity';

export interface IGlobalRateLineItem extends IEntity {
  lineItemId: number;
  materialId?: number;
  price?: number;
  businessUnitId: string;
  businessLineId: string;
  originalId: number;
}
