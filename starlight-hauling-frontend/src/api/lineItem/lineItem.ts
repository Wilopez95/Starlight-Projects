import { ILineItem } from '@root/types';

import { BaseService } from '../base';

export class LineItemService extends BaseService<ILineItem> {
  constructor() {
    super('billable/line-items');
  }
}
