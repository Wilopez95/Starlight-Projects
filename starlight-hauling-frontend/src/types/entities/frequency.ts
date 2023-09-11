import { IEntity } from './entity';
import { IFuturePrice } from './priceGroup';

export interface IFrequency extends IEntity, IFuturePrice {
  type: FrequencyType;
  times?: number;
  price?: string;
  globalPrice?: string;
  globalLimit?: number;
  finalPrice?: string;
  operation?: boolean;
  displayValue?: string;
  value?: string | null;
}

export type FrequencyType = 'xPerWeek' | 'xPerMonth' | 'onCall' | 'everyXDays';

export type ServiceFrequencyAggregated = IFrequency | 'multiple' | null | undefined;
