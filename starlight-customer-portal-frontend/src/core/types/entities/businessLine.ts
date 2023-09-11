import { BusinessLineType } from '@root/core/consts/businessLine';

import type { IEntity } from './index';

export interface IBusinessLine extends IEntity {
  active: boolean;
  description: string;
  name: string;
  type: BusinessLineType;
}
