import type { Point } from 'geojson';

import type { IAddress } from './address';
import type { IEntity } from './entity';
import { ITaxDistrict } from './taxDistrict';

export interface IJobSite extends IEntity {
  address: IAddress;
  location: Point;
  cabOver: boolean;
  alleyPlacement: boolean;
  active?: boolean;
  taxDistricts?: ITaxDistrict[];
  taxDistrictsCount?: number;
}
