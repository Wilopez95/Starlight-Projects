import { BusinessLineType } from '@root/consts/businessLine';

import { IEntity } from './';

export interface IBusinessLine extends IEntity {
  active: boolean;
  description: string;
  name: string;
  type: BusinessLineType;
}
