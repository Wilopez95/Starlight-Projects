import { IBusinessContextIds } from '@root/types';

import { IEntity } from './entity';

export interface IPermit extends IEntity, IBusinessContextIds {
  jobSiteId: number;
  number: string;
  expirationDate: Date;
  active: boolean;
}
