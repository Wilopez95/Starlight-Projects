import { AppliedFilterState } from '@root/common/TableTools/TableFilter';

export interface IJobSitesPageParams {
  id?: string;
}

export interface IJobSitesFilters {
  onApply(filterState: AppliedFilterState): void;
}
