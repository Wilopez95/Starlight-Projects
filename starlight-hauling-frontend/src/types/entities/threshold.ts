import { IBusinessContextIds } from '../base';

import { IEntity } from './entity';

export type ThresholdType = 'overweight' | 'usageDays' | 'demurrage' | 'dump' | 'load';
export type ThresholdSettingsType = 'global' | 'canSize' | 'canSizeAndMaterial' | 'material';
export type ThresholdUnitType = 'ton' | 'day' | 'min';
export type ThresholdUnitLabelType = 'ton' | 'tonne' | 'day' | 'min';

export interface IThreshold extends IEntity {
  active: boolean;
  description: string;
  type: ThresholdType;
  applySurcharges: boolean;
  businessLineId: string;
  unit: ThresholdUnitType;
}

export interface IThresholdSetting extends IEntity, IBusinessContextIds {
  setting: ThresholdSettingsType;
  thresholdId: number;
}
