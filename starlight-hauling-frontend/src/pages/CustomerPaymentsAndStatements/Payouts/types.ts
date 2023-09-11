import { type AppliedFilterState } from '@root/common/TableTools/TableFilter';

export interface IPayoutTable {
  filters?: AppliedFilterState;
  query?: string;
}

export interface IPayoutTableParams {
  id?: string;
}
