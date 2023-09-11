import type { Point } from 'geojson';

import type { IAddress } from './address';
import type { IEntity } from './entity';

export interface IDisposalSite extends IEntity {
  active: boolean;
  description: string;
  waypointType: WaypointType;
  address: IAddress;
  location: Point;
  hasStorage: boolean;
  hasWeighScale: boolean;
}

export type WaypointType =
  | 'homeYard'
  | 'storage'
  | 'landfill'
  | 'transfer'
  | 'recycle'
  | 'landfillStorage';
