export type BestTimeToCome = 'am' | 'pm' | 'specific' | 'any';

export interface IOrderTimePicker {
  staticMode?: boolean;
  disabled?: boolean;
  basePath?: string;
}

export interface IOrderTimePickerData {
  bestTimeToCome: BestTimeToCome;
  bestTimeToComeFrom: Date;
  bestTimeToComeTo: Date;
}

export enum TimeOfDay {
  AmFrom = '06:00',
  AmTo = '11:59',
  PmFrom = '12:00',
  PmTo = '18:00',
}
