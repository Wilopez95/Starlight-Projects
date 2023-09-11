import { ProrationTypeEnum } from '@root/consts';
import { IProrationData } from '@root/types';

export interface IProrationItemComponent extends IProrationData {
  name: string;
  showLabels?: boolean;
  prorationType?: ProrationTypeEnum;
}
