import { ISubscription, ISubscriptionDraft } from '@root/types';

export const isSubscriptionDraft = (
  subscription: ISubscription | ISubscriptionDraft,
): subscription is ISubscriptionDraft => !('status' in subscription) || !subscription.status;
