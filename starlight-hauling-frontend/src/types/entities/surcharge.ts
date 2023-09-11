import { SurchargeCalculation } from '@root/consts';

import { IEntity } from './entity';

export interface ISurcharge extends IEntity {
  active: boolean;
  description: string;
  businessLineId: string;
  calculation: SurchargeCalculation;
  materialBasedPricing?: boolean;
}
