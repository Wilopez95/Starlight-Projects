import { AppliedFilterState } from '@root/common/TableTools/TableFilter';

export interface ICustomerParams {
  customerGroupId: string;
}

export interface ICustomerFilters {
  onApply(filterState: AppliedFilterState): void;
}

export interface ICustomerPageHeader {
  businessUnitId: string;
  customerGroupId: string;
}
