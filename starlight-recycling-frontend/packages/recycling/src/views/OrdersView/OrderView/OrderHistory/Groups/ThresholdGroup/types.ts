export type ThresholdType = 'overweight' | 'usageDays' | 'demurrage' | 'dump' | 'load';
export type ThresholdSettingsType = 'global' | 'canSize' | 'canSizeAndMaterial' | 'material';
export type ThresholdUnitType = 'ton' | 'day' | 'min';
export type ThresholdUnitLabelType = 'ton' | 'tonne' | 'day' | 'min';

export interface IThreshold {
  active: boolean;
  description: string;
  type: ThresholdType;
  applySurcharges: boolean;
  businessLineId: string;
  unit: ThresholdUnitType;
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
