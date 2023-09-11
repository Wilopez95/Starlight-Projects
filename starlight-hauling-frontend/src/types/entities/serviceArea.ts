import { Geometry } from 'geojson';

import { IBusinessContextIds } from '@root/types';

import { IEntity } from './entity';

export interface IServiceArea extends IEntity, IBusinessContextIds {
  active: boolean;
  name: string;
  description: string;
  businessUnitId: string;
  businessLineId: string;
  geometry: Geometry;
  id: number;
  originalId?: number;
}
export type IMatchedServiceAreas = Record<'matched' | 'unmatched', IServiceArea[]>;
