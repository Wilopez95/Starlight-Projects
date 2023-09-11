import { IEntity } from './entity';

export enum COMMENTS_EVENT_TYPE {
  comment = 'COMMENT',
  arrivedOnSite = 'ARRIVED_ON_SITE',
}

export interface IWorkOrderComment extends IEntity {
  workOrderId: number;
  authorId: string | number;
  authorName: string;
  authorRole: string;
  comment: string;
  eventType: string;
}
