import { Regions } from '@root/i18n/config/region';

import { IEntity } from './entity';

export interface ITenant extends IEntity {
  name: string;
  region: Regions;
  legalName: string;
}
