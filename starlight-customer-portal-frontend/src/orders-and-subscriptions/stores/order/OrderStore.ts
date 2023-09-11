import { observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import type GlobalStore from '@root/app/GlobalStore';
import { BaseStore } from '@root/core/stores/base/BaseStore';
import { OrderService } from '@root/orders-and-subscriptions/api';

import type { GetCountOptions, OrderStoreCount } from './types';

export class OrderStore extends BaseStore<any> {
  private readonly service: OrderService = new OrderService();

  @observable allCounts?: OrderStoreCount;
  @observable myCounts?: OrderStoreCount;

  constructor(global: GlobalStore) {
    super(global);
  }

  @actionAsync
  async requestCount({ businessUnitId }: GetCountOptions) {
    try {
      const [countResponse, myCountResponse] = await task(
        Promise.all([
          this.service.getCount({
            finalizedOnly: false,
            businessUnitId,
          }),
          this.service.getCount({
            mine: true,
            businessUnitId,
          }),
        ]),
      );

      this.allCounts = {
        total: countResponse.total,
        ...countResponse.statuses,
      };
      this.myCounts = {
        total: myCountResponse.total,
        ...myCountResponse.statuses,
      };
    } catch (error) {
      console.error('Order RequestCount Error', error);
    }
  }

  getCounts(mine: boolean) {
    return mine ? this.myCounts : this.allCounts;
  }
}
