import * as Sentry from '@sentry/react';
import { action } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { CommonService } from '@root/api';
import { convertOrderStoreCounts } from '@root/stores/order/helpers';

import { ApiError } from '@root/api/base/ApiError';
import type GlobalStore from '../GlobalStore';
import { convertSubscriptionStoreCounts } from '../subscription/helpers';

import { mapCounts } from './helpers';

export class CommonStore {
  private globalStore: GlobalStore;

  private loadedForBusinessUnitId?: string;

  constructor(global: GlobalStore) {
    this.globalStore = global;
  }

  @actionAsync
  async requestNavigationCounts(businessUnitId: string, { withCustomerGroups = true } = {}) {
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
      this.globalStore.chatStore.counts = mapCounts(counts.chats);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'Common',
        message: `Navigation Counts Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @action
  clearLoadedForBusinessUnitId() {
    this.loadedForBusinessUnitId = undefined;
  }
}
