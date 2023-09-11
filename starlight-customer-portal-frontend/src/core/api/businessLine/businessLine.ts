import { IBusinessLine } from '@root/core/types';

import { BaseService } from '../base';

const baseUrl = 'business-lines';

export class BusinessLineService extends BaseService<IBusinessLine> {
  constructor() {
    super(baseUrl);
  }
}
