import { IThreshold } from '@root/types';

import { BaseService } from '../base';

export class ThresholdService extends BaseService<IThreshold> {
  constructor() {
    super('billable/thresholds');
  }
}
