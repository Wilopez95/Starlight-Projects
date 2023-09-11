import { AppliedFilterState } from '@root/common/TableTools/TableFilter';

export interface ILandfillOperationsFilters {
  onApply(state: AppliedFilterState): void;
}
