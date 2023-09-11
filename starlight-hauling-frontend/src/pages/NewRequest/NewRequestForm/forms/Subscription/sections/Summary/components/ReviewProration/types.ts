import { ISubscriptionProration } from '@root/types';

export interface IReviewProration {
  proration: ISubscriptionProration;
  isReviewProrationModalOpen: boolean;
  subscriptionId?: number;
  onOpenReviewProrationModal(): void;
  onCloseReviewProrationModal(): void;
}
