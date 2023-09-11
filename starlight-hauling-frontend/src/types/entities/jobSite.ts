import { type Point } from 'geojson';

import { GeometryType } from '@root/consts';

import { type IAddress } from './address';
import { type IEntity } from './entity';
import { ITaxDistrict } from './taxDistrict';

export interface IGeofence {
  type: GeometryType;
  radius?: number;
  coordinates?: GeoJSON.Position[][];
}

export interface IJobSite extends IEntity {
  name?: string;
  address: IAddress;
  location: Point;
  cabOver: boolean;
  alleyPlacement: boolean;
  recyclingDefault: boolean;
  active?: boolean;
  taxDistricts?: ITaxDistrict[];
  taxDistrictsCount?: number;
  radius?: number;
  polygon?: { coordinates: GeoJSON.Position[][] };
  contactId?: number;
}
