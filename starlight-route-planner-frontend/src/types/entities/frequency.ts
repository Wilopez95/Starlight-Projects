export interface IFrequency {
  type: FrequencyType;
  id: string;
  times?: number;
  price?: string;
  globalLimit?: number;
  finalPrice?: string;
  operation?: boolean;
  value?: string | null;
  displayValue?: string;
}

export type FrequencyType = 'xPerWeek' | 'xPerMonth' | 'onCall' | 'everyXDays';
