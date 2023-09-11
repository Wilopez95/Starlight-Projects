import { IEntity, COMMENTS_EVENT_TYPE } from '@root/types';

export interface IWorkOrderCommentParams extends IEntity {
  workOrderId: number;
  eventType: COMMENTS_EVENT_TYPE;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  comment?: string;
}
