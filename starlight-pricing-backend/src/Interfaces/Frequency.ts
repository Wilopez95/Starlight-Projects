import { IEntity } from './Entity';

export type FrequencyType = 'xPerWeek' | 'xPerMonth' | 'onCall' | 'everyXDays';

export interface IServiceFrequency extends IEntity {
  type: FrequencyType;
  times?: number;
  price?: string;
  globalPrice?: string;
  globalLimit?: number;
  finalPrice?: string;
  operation?: boolean;
  displayValue?: string;
  value?: string | null;
  nextPrice?: number;
  effectiveDate?: Date | null;
}

export interface IFrequency {
  id?: number;
  serviceFrequency: IServiceFrequency[];
  type: string;
  times?: number;
  price?: string;
  globalPrice?: string;
  globalLimit?: number;
  finalPrice?: string;
  operation?: boolean;
  displayValue?: string;
  value?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
