import { Geometry } from 'geojson';

import { IBusinessContextIds } from '@root/types';

import { IEntity } from './entity';

export interface IServiceArea extends IEntity, IBusinessContextIds {
  active: boolean;
  name: string;
  description: string;
  businessUnitId: number;
  businessLineId: number;
  geometry: Geometry;
  id: number;
  originalId?: number;
}
