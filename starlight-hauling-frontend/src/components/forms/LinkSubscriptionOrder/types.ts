import { ClientRequestType } from '@root/consts';
import { ISubscription } from '@root/types';

import { IForm } from '../types';

export const LinkRequest = [
  ClientRequestType.SubscriptionNonService,
  ClientRequestType.SubscriptionOrder,
];

export type LinkRequestType = (typeof LinkRequest)[number];

export interface ILinkSubscriptionOrderData {
  requestType: LinkRequestType;
  subscriptionId?: number;
}

export interface ILinkSubscriptionOrderForm extends IForm<ILinkSubscriptionOrderData> {
  title: string;
  subscriptions: ISubscription[];
}
