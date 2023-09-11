import { IEntity } from './Entity';

export interface Geometry {
  type: string;
  coordinates: number[];
}
export interface IServiceArea extends IEntity {
  active: boolean;
  name: string;
  description: string;
  businessUnitId: string;
  businessLineId: string;
  geometry: Geometry;
  id: number;
  originalId?: number;
}
