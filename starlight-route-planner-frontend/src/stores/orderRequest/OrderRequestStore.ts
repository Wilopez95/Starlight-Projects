import { observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { OrderRequestService } from '@root/api';

import { IOrderRequestCount } from '@root/types';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { OrderRequestCount } from './types';

export class OrderRequestStore extends BaseStore<IOrderRequestCount> {
  private readonly service = new OrderRequestService();

  @observable count?: OrderRequestCount;

  constructor(global: GlobalStore) {
    super(global);
    this.count = { total: 0 };
  }

  @actionAsync
  async requestCount(businessUnitId: number) {
    try {
      const count = await task(
        this.service.getCount({
          businessUnitId,
        }),
      );

      this.count = count;
    } catch (error) {
      console.error('Order RequestCount Error', error);
    }
  }
}
