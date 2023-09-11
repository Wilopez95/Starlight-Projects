import { actionAsync, task } from 'mobx-utils';

import { DailyRouteHistoryService } from '@root/api/dailyRouteHistory';
import { ExpandedError } from '@root/helpers';
import { AvailableDailyRouteHistoryAttributes } from '@root/types';

import { IOrderHistoryGroup } from '@root/common/OrderHistory/components/HistoryGroup/types';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { DailyRouteHistory } from './DailyRouteHistory';

export class DailyRouteHistoryStore extends BaseStore<
  IOrderHistoryGroup<keyof typeof AvailableDailyRouteHistoryAttributes>
> {
  private readonly service: DailyRouteHistoryService;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new DailyRouteHistoryService();
  }

  @actionAsync
  async getHistory(dailyRouteId: number) {
    try {
      this.loading = true;
      const { dailyRouteHistory } = await task(this.service.getDailyRouteHistory(dailyRouteId));

      if (dailyRouteHistory) {
        this.setItems(
          dailyRouteHistory.map(historyItem => new DailyRouteHistory(this, historyItem)),
        );
      }
    } catch (error) {
      console.error('Failed to get Work Order Comments', error);
      ExpandedError.sentryWithNotification({
        error,
        action: 'getDailyRouteHistory',
      });
    } finally {
      this.loading = false;
    }
  }
}
