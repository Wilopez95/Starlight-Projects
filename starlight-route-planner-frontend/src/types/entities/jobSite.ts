import { Position } from 'geojson';

import { IAddress } from './address';
import { IEntity } from './entity';

export interface IJobSite extends IEntity {
  id: number;
  name: string;
  address: IAddress;
  location: string;
  coordinates: Position;
}
