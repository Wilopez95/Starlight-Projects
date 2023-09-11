import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { SubscriptionStore } from '@root/stores/subscription/SubscriptionStore';
import { SubscriptionDraftStore } from '@root/stores/subscriptionDraft/SubscriptionDraftStore';

export type Store = SubscriptionDraftStore | SubscriptionStore;

export interface ISubscriptionFilters {
  relatedStore: Store;
  onApply(filterState: AppliedFilterState): void;
}
