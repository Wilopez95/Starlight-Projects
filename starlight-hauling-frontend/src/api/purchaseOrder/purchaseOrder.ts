import { IPurchaseOrder } from '@root/types';

import { BaseService } from '../base';

export class PurchaseOrderService extends BaseService<IPurchaseOrder> {
  constructor() {
    super('purchase-orders');
  }
}
