import { IBusinessContextIds } from '@root/core/types';

import { IEntity } from './entity';

export interface IPermit extends IEntity, IBusinessContextIds {
  jobSiteId: number;
  number: string;
  expirationDate: Date;
  active: boolean;
}
