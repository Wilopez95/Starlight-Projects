import { observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { IndependentOrderService } from '@root/api';
import { IIndependentOrderStore, IStoreCount } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

export class IndependentOrderStore extends BaseStore<IIndependentOrderStore> {
  @observable allCounts?: IStoreCount;
  private readonly service: IndependentOrderService;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new IndependentOrderService();
  }

  @actionAsync
  async getIndependentOrderStatus(independentOrderId: number) {
    try {
      const { haulingIndependentOrder } = await task(
        this.service.getIndependentOrderStatus(independentOrderId),
      );

      return haulingIndependentOrder.status;
    } catch (error) {
      console.error('Independent Order Status', error);
    }
  }
}
