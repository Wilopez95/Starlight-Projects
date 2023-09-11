import { BusinessLineType } from '@root/consts/businessLine';

import { type IEntity } from './';

export interface IBusinessLine extends IEntity {
  active: boolean;
  description: string;
  name: string;
  shortName: string;
  type: BusinessLineType;
  spUsed: boolean;
  billingCycle?: string;
  billingType?: string;
}
