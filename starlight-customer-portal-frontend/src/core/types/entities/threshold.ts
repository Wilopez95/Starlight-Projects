import { IBusinessContextIds } from '../base';

import { IEntity } from './entity';

export type ThresholdType = 'overweight' | 'usageDays' | 'demurrage';
export type ThresholdSettingsType = 'global' | 'canSize' | 'canSizeAndMaterial' | 'material';
export type ThresholdUnitType = 'ton' | 'day' | 'min';

export interface IThreshold extends IEntity {
  active: boolean;
  description: string;
  type: ThresholdType;
  businessLineId: string;
}

export interface IThresholdSetting extends IEntity, IBusinessContextIds {
  setting: ThresholdSettingsType;
  thresholdId: number;
}
