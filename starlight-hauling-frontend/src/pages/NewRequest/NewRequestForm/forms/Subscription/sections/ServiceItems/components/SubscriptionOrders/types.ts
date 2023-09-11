import {
  INewSubscriptionOrder,
  INewSubscriptionService,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export interface ISubscriptionOrders {
  serviceItem: INewSubscriptionService;
  serviceIndex: number;
  isSubscriptionDraftEdit: boolean;
  isServiceRemoved: boolean;
  finalSubscriptionOrdersQuantity: number;
  isSubscriptionClosed?: boolean;
  endDate?: Date;
  updateSubOrder: (subOrder: INewSubscriptionOrder, serviceIndex: number) => void;
  deleteSubOrder: (serviceIndex: number, subOrderIndex: number) => void;
}

export interface ISubscriptionOrder {
  subscriptionOrder: INewSubscriptionOrder;
  subscriptionOrderIndex: number;
  serviceIndex: number;
  isSubscriptionDraftEdit: boolean;
  isSubscriptionClosed?: boolean;

  onRemove(): void;
}
