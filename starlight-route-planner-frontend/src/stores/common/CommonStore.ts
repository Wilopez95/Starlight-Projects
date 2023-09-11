import { actionAsync, task } from 'mobx-utils';

import { CommonService } from '@root/api';
import { convertOrderStoreCounts } from '@root/stores/order/helpers/convertOrderStoreCounts';

import type GlobalStore from '../GlobalStore';
import { convertSubscriptionStoreCounts } from '../subscription/helpers';

import { mapCounts } from './helpers';

export class CommonStore {
  private globalStore: GlobalStore;

  private loadedForBusinessUnitId?: number;

  constructor(global: GlobalStore) {
    this.globalStore = global;
  }

  @actionAsync
  async requestNavigationCounts(businessUnitId: number, { withCustomerGroups = true } = {}) {
    if (this.loadedForBusinessUnitId === businessUnitId) {
      return;
    }
    this.loadedForBusinessUnitId = businessUnitId;
    try {
      const [counts] = await task(
        Promise.all([
          CommonService.getNavigationCounts(businessUnitId),
          withCustomerGroups ? this.globalStore.customerGroupStore.request() : Promise.resolve(),
        ]),
      );

      this.globalStore.jobSiteStore.counts = mapCounts(counts.jobSites);
      this.globalStore.orderStore.allCounts = convertOrderStoreCounts(mapCounts(counts.orders));
      this.globalStore.orderStore.myCounts = convertOrderStoreCounts(mapCounts(counts.mineOrders));
      this.globalStore.subscriptionStore.allCounts = convertSubscriptionStoreCounts(
        mapCounts(counts.subscriptions),
      );
      this.globalStore.subscriptionStore.myCounts = convertSubscriptionStoreCounts(
        mapCounts(counts.mineSubscriptions),
      );
      this.globalStore.subscriptionDraftStore.allCounts = mapCounts(counts.subscriptionDrafts);
      this.globalStore.subscriptionDraftStore.myCounts = mapCounts(counts.mineSubscriptionDrafts);

      this.globalStore.subscriptionOrderStore.allCounts = mapCounts(counts.subscriptionOrders);

      this.globalStore.customerStore.counts = mapCounts(counts.customers);
      this.globalStore.landfillOperationStore.counts = mapCounts(counts.landfillOperations);
    } catch (error) {
      console.error('Navigation Counts Request', error);
    }
  }
}
