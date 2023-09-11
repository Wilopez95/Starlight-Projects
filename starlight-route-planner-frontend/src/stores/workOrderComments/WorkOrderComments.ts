import { IWorkOrderComment, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { WorkOrderCommentsStore } from './WorkOrderCommentsStore';

export class WorkOrderComment extends BaseEntity implements IWorkOrderComment {
  authorId: string | number;
  authorName: string;
  authorRole: string;
  comment: string;
  workOrderId: number;
  eventType: string;

  store: WorkOrderCommentsStore;

  constructor(store: WorkOrderCommentsStore, entity: JsonConversions<IWorkOrderComment>) {
    super(entity);

    this.store = store;

    this.id = entity.id;
    this.authorId = entity.authorId;
    this.authorName = entity.authorName;
    this.authorRole = entity.authorRole;
    this.comment = entity.comment;
    this.workOrderId = entity.workOrderId;
    this.eventType = entity.eventType;
  }
}
