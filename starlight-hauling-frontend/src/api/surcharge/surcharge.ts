import { ISurcharge } from '@root/types';

import { BaseService } from '../base';

export class SurchargeService extends BaseService<ISurcharge> {
  constructor() {
    super('billable/surcharges');
  }
}
