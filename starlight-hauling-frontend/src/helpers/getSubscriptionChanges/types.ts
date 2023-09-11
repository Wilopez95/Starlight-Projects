import { UpdateSubscriptionItemType } from '@root/consts';
import {
  INewSubscription,
  INewSubscriptionLineItem,
  INewSubscriptionOrder,
  INewSubscriptionService,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export interface Item {
  quantity: number;
  id?: number;
}

export interface ItemChanges<T> {
  eventType: UpdateSubscriptionItemType;
  currentValues: T;
  previousValues?: T;
  id?: number;
}

export interface ILineItemChanges extends Partial<INewSubscriptionLineItem> {
  eventType: UpdateSubscriptionItemType;
  currentValues: INewSubscriptionLineItem;
  previousValues?: INewSubscriptionLineItem;
}

export interface ISubscriptionOrderChanges extends Partial<INewSubscriptionOrder> {
  eventType: UpdateSubscriptionItemType;
  currentValues: INewSubscriptionOrder;
  previousValues?: INewSubscriptionOrder;
}

export interface ISubscriptionServiceChanges
  extends Omit<Partial<INewSubscriptionService>, 'lineItems' | 'subscriptionOrders'> {
  currentValues: INewSubscriptionService;
  eventType?: UpdateSubscriptionItemType;
  previousValues?: INewSubscriptionService;
  lineItems?: ILineItemChanges[];
  subscriptionOrders?: ISubscriptionOrderChanges[];
}

export interface ISubscriptionChanges extends Omit<Partial<INewSubscription>, 'serviceItems'> {
  serviceItems?: ISubscriptionServiceChanges[];
}

export interface IGetSubscriptionChangesOptions {
  editableSubscriptionProps: (keyof INewSubscription)[];
  editableServiceItemProps: (keyof INewSubscriptionService)[];
  editableLineItemProps: (keyof INewSubscriptionLineItem)[];
  editableSubscriptionOrderProps: (keyof INewSubscriptionOrder)[];
  skipComparisonSubscriptionProps?: boolean;
  skipComparisonAddedItem?: boolean;
  skipComparisonPropsForRemoved?: boolean;
}
