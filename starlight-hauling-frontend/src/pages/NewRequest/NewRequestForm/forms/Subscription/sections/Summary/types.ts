import { ISubscriptionProration } from '@root/types';

import { INewSubscription } from '../../types';

export interface ISummarySection {
  proration: ISubscriptionProration | null;
  isSubscriptionClosed?: boolean;
  subscriptionValues?: INewSubscription;
  isReviewProrationModalOpen: boolean;
  onOpenReviewProrationModal(): void;
  onCloseReviewProrationModal(): void;
}
