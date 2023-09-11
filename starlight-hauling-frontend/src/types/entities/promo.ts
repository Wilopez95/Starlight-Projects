import { IBusinessContextIds } from '@root/types';

import { IEntity } from './entity';

export interface IPromo extends IEntity, IBusinessContextIds {
  active: boolean;
  code: string;
  description: string | null;
  note: string | null;
  startDate: Date | null;
  endDate: Date | null;
}
