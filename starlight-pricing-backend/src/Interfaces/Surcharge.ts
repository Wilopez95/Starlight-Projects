import { IEntity } from './Entity';

export const enum SurchargeCalculation {
  Flat = 'flat',
  Percentage = 'percentage',
}

export interface ISurcharge extends IEntity {
  active: boolean;
  description: string;
  businessLineId: string;
  calculation: SurchargeCalculation;
  materialBasedPricing?: boolean;
}
