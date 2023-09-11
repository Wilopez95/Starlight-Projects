import { AppliedFilterState } from '@root/common/TableTools/TableFilter';

export interface ISubscriptionOrdersFilter {
  onApply(filterState: AppliedFilterState): void;
}
