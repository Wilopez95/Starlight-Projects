import { IEntity } from '@root/core/types';
import { INewSubscription } from '@root/customer/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export type SubscriptionRequest = INewSubscription & IEntity;
