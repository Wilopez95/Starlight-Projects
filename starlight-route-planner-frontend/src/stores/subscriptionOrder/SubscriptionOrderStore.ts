import { observable } from 'mobx';
import { actionAsync } from 'mobx-utils';

import { SubscriptionOrderService } from '@root/api';
import { ExpandedError } from '@root/helpers';
import { IStoreCount, SubscriptionOrder } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

export class SubscriptionOrderStore extends BaseStore<SubscriptionOrder> {
  @observable allCounts?: IStoreCount;
  private readonly service: SubscriptionOrderService;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new SubscriptionOrderService();
  }

  @actionAsync
  async getSubscriptionOrderStatus(subscriptionOrderId: number) {
    try {
      const { haulingSubscriptionOrder } = await this.service.getSubscriptionOrderStatus(
        subscriptionOrderId,
      );

      return haulingSubscriptionOrder.status;
    } catch (error) {
      ExpandedError.sentryWithNotification({ error, action: 'default', code: 'UNKNOWN' }, [
        subscriptionOrderId,
      ]);
    }
  }
}
