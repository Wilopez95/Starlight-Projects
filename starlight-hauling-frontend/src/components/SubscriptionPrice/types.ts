import { IBillableService, ILineItem, ISubscriptionProration } from '@root/types';

export interface ISubscriptionPrice {
  proration: ISubscriptionProration | null;
  billableServices: IBillableService[];
  billableLineItems: ILineItem[];
}
