import { actionAsync, task } from 'mobx-utils';

import { IWorkOrderCommentParams, WorkOrderCommentsService } from '@root/api';
import { IWorkOrderComment } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { WorkOrderComment } from './WorkOrderComments';

export class WorkOrderCommentsStore extends BaseStore<IWorkOrderComment> {
  private readonly service: WorkOrderCommentsService;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new WorkOrderCommentsService();
  }

  @actionAsync
  async createComment(params: IWorkOrderCommentParams) {
    try {
      const { createComment } = await task(this.service.createWorkOrderComment(params));

      this.setItem(new WorkOrderComment(this, createComment));
      this.globalStore.workOrdersStore.addComment(params.workOrderId, params);
    } catch (error) {
      console.error('Failed to create Work Order Comment', error);
    }
  }

  @actionAsync
  async getComments(workOrderId: string | number) {
    try {
      this.cleanup();
      const { workOrder } = await task(this.service.getWorkOrderComments(workOrderId.toString()));

      this.setItems(workOrder.comments.map(comment => new WorkOrderComment(this, comment)));
    } catch (error) {
      console.error('Failed to get Work Order Comments', error);
    }
  }
}
