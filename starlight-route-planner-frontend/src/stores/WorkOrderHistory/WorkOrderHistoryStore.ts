import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { WorkOrderHistoryService } from '@root/api';
import { BusinessLineType } from '@root/consts';
import { IWorkOrderHistory } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { WorkOrderHistory } from './WorkOrderHistory';

export class WorkOrderHistoryStore extends BaseStore<IWorkOrderHistory> {
  private readonly service: WorkOrderHistoryService;
  @observable workOrderType?: BusinessLineType;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new WorkOrderHistoryService();
  }

  @action
  setWorkOrderType(type?: BusinessLineType) {
    this.workOrderType = type;
  }

  @actionAsync
  async getHistory(workOrderId: number) {
    try {
      this.loading = true;
      const { workOrderHistory } = await task(this.service.getWorkOrderHistory(workOrderId));

      if (workOrderHistory) {
        this.setItems(workOrderHistory.map(historyItem => new WorkOrderHistory(this, historyItem)));
      }
    } catch (error) {
      console.error('Failed to get Work Order Comments', error);
    } finally {
      this.loading = false;
    }
  }
}
