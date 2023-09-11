import { IBusinessContextIds } from '@root/core/types';

import { IEntity } from './entity';

export interface IPromo extends IEntity, IBusinessContextIds {
  active: boolean;
  code: string;
  description: string | null;
  note: string | null;
  startDate: Date | null;
  endDate: Date | null;
}
