import { type AppliedFilterState } from '@root/common/TableTools/TableFilter';

export interface IPaymentTable {
  filters?: AppliedFilterState;
  query?: string;
}

export interface IPaymentTableParams {
  id?: string;
}
