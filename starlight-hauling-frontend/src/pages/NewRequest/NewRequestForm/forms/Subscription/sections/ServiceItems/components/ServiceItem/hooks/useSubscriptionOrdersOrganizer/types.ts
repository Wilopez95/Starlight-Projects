import { INewServiceItemSubscriptionOrders } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export interface ISubscriptionOrdersOrganizer {
  serviceItemSubscriptionOrders: INewServiceItemSubscriptionOrders;

  updateServiceItemSubscriptionOrders(
    serviceItemSubscriptionOrders: INewServiceItemSubscriptionOrders,
  ): void;
}
