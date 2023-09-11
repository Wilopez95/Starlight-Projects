import {
  INewServiceItemSubscriptionOrders,
  INewSubscriptionService,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { IBillableService } from '@root/types';

export interface ISubscriptionOrderWithServiceItemSynchroniser {
  isSubscriptionDraftEdit: boolean;
  serviceItem: INewSubscriptionService;
  billableServices: IBillableService[];
  subscriptionEndDate?: Date;
  initialServiceItem?: INewSubscriptionService;

  updateServiceItemSubscriptionOrders(
    serviceItemSubscriptionOrders: INewServiceItemSubscriptionOrders,
  ): void;
}
