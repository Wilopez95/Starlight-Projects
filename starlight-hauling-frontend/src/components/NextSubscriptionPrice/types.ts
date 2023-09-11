import { IBillableService, ILineItem, ISubscriptionProration } from '@root/types';

export interface INextSubscriptionPrice {
  proration: ISubscriptionProration | null;
  billableServices: IBillableService[];
  billableLineItems: ILineItem[];
}
